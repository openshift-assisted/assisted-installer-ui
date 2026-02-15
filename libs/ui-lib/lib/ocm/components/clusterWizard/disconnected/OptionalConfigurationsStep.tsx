import * as React from 'react';
import { Formik } from 'formik';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import {
  ClusterWizardStep,
  TechnologyPreview,
  sshPublicKeyValidationSchema,
  getFormikErrorFields,
  httpProxyValidationSchema,
  noProxyValidationSchema,
  ipValidationSchema,
  InputField,
  CheckboxField,
  AdditionalNTPSourcesField,
  ProxyFieldsType,
  PullSecret,
  pullSecretValidationSchema,
} from '../../../../common';
import { Split, SplitItem, Grid, GridItem, Form, Content } from '@patternfly/react-core';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import UploadSSH from '../../../../common/components/clusterConfiguration/UploadSSH';
import { ProxyInputFields } from '../../../../common/components/clusterConfiguration/ProxyFields';
import { handleApiError, getApiErrorMessage } from '../../../../common/api';
import { useAlerts } from '../../../../common/components/AlertsContextProvider';
import { AlertVariant } from '@patternfly/react-core';
import InfraEnvsService from '../../../services/InfraEnvsService';
import { InfraEnvsAPI } from '../../../services/apis';
import usePullSecret from '../../../hooks/usePullSecret';
import { useParams } from 'react-router-dom-v5-compat';
import ClustersService from '../../../services/ClustersService';
import {
  Cluster,
  InfraEnv,
  InfraEnvCreateParams,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import { HostsNetworkConfigurationControlGroup } from '../../clusterConfiguration/HostsNetworkConfigurationControlGroup';
import { HostsNetworkConfigurationType } from '../../../services/types';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getDummyInfraEnvField } from '../../clusterConfiguration/staticIp/data/dummyData';
import { ntpSourceValidationSchema } from '../../../../common/validationSchemas/ntpValidation';
import { isInOcm } from '../../../../common/api';

const DEFAULT_CPU_ARCHITECTURE = 'x86_64' as const;
const DISCONNECTED_IMAGE_TYPE = 'disconnected-iso' as const;

type OptionalConfigurationsFormValues = ProxyFieldsType & {
  sshPublicKey?: string;
  enableNtpSources: boolean;
  additionalNtpSources?: string;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
  rendezvousIp?: string;
  pullSecret?: string;
};

const DEFAULT_INITIAL_VALUES: OptionalConfigurationsFormValues = {
  sshPublicKey: '',
  enableProxy: false,
  httpProxy: '',
  httpsProxy: '',
  noProxy: '',
  enableNtpSources: false,
  additionalNtpSources: '',
  hostsNetworkConfigurationType: HostsNetworkConfigurationType.DHCP,
  rendezvousIp: '',
  pullSecret: '',
};

/**
 * Rehydrate form values from infraEnv when navigating back to this step.
 */
const infraEnvToFormValues = (infraEnv: InfraEnv): OptionalConfigurationsFormValues => ({
  ...DEFAULT_INITIAL_VALUES,
  sshPublicKey: infraEnv.sshAuthorizedKey ?? '',
  enableProxy: !!(infraEnv.proxy?.httpProxy || infraEnv.proxy?.httpsProxy),
  httpProxy: infraEnv.proxy?.httpProxy ?? '',
  httpsProxy: infraEnv.proxy?.httpsProxy ?? '',
  noProxy: infraEnv.proxy?.noProxy ?? '',
  enableNtpSources: !!infraEnv.additionalNtpSources,
  additionalNtpSources: infraEnv.additionalNtpSources ?? '',
  hostsNetworkConfigurationType:
    infraEnv.hostsNetworkConfigurationType === 'static'
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP,
  rendezvousIp: infraEnv.rendezvousIp ?? '',
});

/**
 * Builds common infrastructure environment params from form values
 */
const buildInfraEnvParams = (values: OptionalConfigurationsFormValues) => {
  // Build proxy object - only include fields that have values
  const proxy = {
    ...(values.httpProxy && { httpProxy: values.httpProxy }),
    ...(values.httpsProxy && { httpsProxy: values.httpsProxy }),
    ...(values.noProxy && { noProxy: values.noProxy }),
  };
  const hasProxy = Object.keys(proxy).length > 0;

  return {
    ...(values.sshPublicKey && { sshAuthorizedKey: values.sshPublicKey }),
    ...(hasProxy && { proxy }),
    ...(values.additionalNtpSources && {
      additionalNtpSources: values.additionalNtpSources,
    }),
    ...(values.rendezvousIp && { rendezvousIp: values.rendezvousIp }),
    // Initialize with dummy static network config when static IP is selected
    // This is required for the StaticIpPage to render properly
    ...(values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC && {
      staticNetworkConfig: getDummyInfraEnvField(),
    }),
  };
};

const getValidationSchema = (t: TFunction, requirePullSecret: boolean) =>
  Yup.lazy((values: OptionalConfigurationsFormValues) =>
    Yup.object().shape({
      sshPublicKey: sshPublicKeyValidationSchema(t),
      enableProxy: Yup.boolean().required(),
      httpProxy: httpProxyValidationSchema({
        values,
        pairValueName: 'httpsProxy',
        allowEmpty: true,
        t,
      }),
      httpsProxy: httpProxyValidationSchema({
        values,
        pairValueName: 'httpProxy',
        allowEmpty: true,
        t,
      }),
      noProxy: noProxyValidationSchema(t),
      enableNtpSources: Yup.boolean().required(),
      additionalNtpSources: ntpSourceValidationSchema(t),
      hostsNetworkConfigurationType: Yup.string()
        .oneOf(Object.values(HostsNetworkConfigurationType))
        .required(),
      rendezvousIp: Yup.string()
        .max(45, 'IP address must be at most 45 characters')
        .test(
          'ip-validation',
          'Not a valid IP address',
          (value) => !value || ipValidationSchema(t).isValidSync(value),
        ),
      ...(requirePullSecret && {
        pullSecret: pullSecretValidationSchema(t).required(t('ai:Required field')),
      }),
    }),
  );

const OptionalConfigurationsStep = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const [cluster, setCluster] = React.useState<Cluster | null>(null);
  const { t } = useTranslation();
  const defaultPullSecret = usePullSecret();

  const { moveNext, moveBack, setDisconnectedInfraEnv, disconnectedInfraEnv } =
    useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();

  React.useEffect(() => {
    const fetchCluster = async () => {
      if (!clusterId) {
        return;
      }
      try {
        const fetchedCluster = await ClustersService.get(clusterId);
        setCluster(fetchedCluster);
      } catch (error) {
        handleApiError(error, () => {
          addAlert({
            title: t('ai:Failed to fetch cluster'),
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      }
    };
    void fetchCluster();
  }, [clusterId, addAlert, t]);

  const initialValues: OptionalConfigurationsFormValues = disconnectedInfraEnv
    ? infraEnvToFormValues(disconnectedInfraEnv)
    : DEFAULT_INITIAL_VALUES;

  return (
    <Formik
      initialValues={initialValues}
      validateOnMount
      validationSchema={getValidationSchema(t, !isInOcm)}
      onSubmit={async (values) => {
        clearAlerts();
        if (!cluster?.id) {
          addAlert({
            title: t('ai:Missing cluster'),
            message: t('ai:Cluster must be created before configuring infrastructure environment'),
            variant: AlertVariant.danger,
          });
          return;
        }

        const commonParams = buildInfraEnvParams(values);
        // Default pull secret only exists in OCM; when !isInOcm the user must provide it via the field
        const pullSecretToUse = isInOcm ? defaultPullSecret : values.pullSecret;

        try {
          if (disconnectedInfraEnv?.id) {
            // Update existing infraEnv
            const updateParams: InfraEnvUpdateParams = {
              ...commonParams,
              imageType: DISCONNECTED_IMAGE_TYPE,
              pullSecret: pullSecretToUse,
            };
            const { data: updatedInfraEnv } = await InfraEnvsAPI.update(
              disconnectedInfraEnv.id,
              updateParams,
            );
            setDisconnectedInfraEnv({
              ...updatedInfraEnv,
              // infraEnv does not return the whole OCP version
              openshiftVersion: cluster.openshiftVersion,
            });
          } else {
            // Create new infraEnv
            const createParams: InfraEnvCreateParams = {
              name: InfraEnvsService.makeInfraEnvName(DEFAULT_CPU_ARCHITECTURE, cluster.name),
              clusterId: cluster.id,
              openshiftVersion: cluster.openshiftVersion,
              cpuArchitecture: DEFAULT_CPU_ARCHITECTURE,
              imageType: DISCONNECTED_IMAGE_TYPE,
              pullSecret: pullSecretToUse ?? '',
              ...commonParams,
            };
            const createdInfraEnv = await InfraEnvsService.create(createParams);
            setDisconnectedInfraEnv({
              ...createdInfraEnv,
              // infraEnv does not return the whole OCP version
              openshiftVersion: cluster.openshiftVersion,
            });
          }
          moveNext();
        } catch (error) {
          handleApiError(error, () => {
            addAlert({
              title: disconnectedInfraEnv?.id
                ? t('ai:Failed to update infrastructure environment')
                : t('ai:Failed to create infrastructure environment'),
              message: getApiErrorMessage(error),
              variant: AlertVariant.danger,
            });
          });
        }
      }}
    >
      {({ submitForm, isValid, errors, touched, isSubmitting, values }) => {
        const errorFields = getFormikErrorFields(errors, touched);
        const handleNext = () => {
          void submitForm(); // This will trigger onSubmit
        };

        return (
          <ClusterWizardStep
            navigation={<ClusterWizardNavigation />}
            footer={
              <ClusterWizardFooter
                disconnectedClusterId={clusterId}
                onNext={handleNext} // Changed from moveNext
                onBack={moveBack}
                isNextDisabled={!isValid || !cluster}
                errorFields={errorFields}
                isSubmitting={isSubmitting}
              />
            }
          >
            <WithErrorBoundary title="Failed to load Optional Configurations step">
              <Grid hasGutter>
                <GridItem>
                  <Split>
                    <SplitItem>
                      <Content component="h2">{t('ai:Optional configurations')}</Content>
                    </SplitItem>
                    <SplitItem>
                      <TechnologyPreview />
                    </SplitItem>
                  </Split>
                </GridItem>
                <GridItem>
                  <Form id="wizard-cluster-optional-configurations__form">
                    {/* Pull secret (!OCM only) */}
                    {!isInOcm && <PullSecret defaultPullSecret={defaultPullSecret} isOcm={false} />}

                    {/* Rendezvous IP */}
                    <InputField
                      label={t('ai:Rendezvous IP')}
                      name="rendezvousIp"
                      helperText={t(
                        'ai:The IP address that hosts will use to communicate with the bootstrap node during installation.',
                      )}
                      placeholder="e.g., 192.168.1.10"
                      maxLength={45}
                    />

                    <UploadSSH />

                    {/* Proxy Settings */}
                    <CheckboxField
                      label={t('ai:Configure proxy settings')}
                      name="enableProxy"
                      helperText={
                        <p>
                          {t(
                            'ai:If hosts are behind a firewall that requires the use of a proxy, provide additional information about the proxy.',
                          )}
                        </p>
                      }
                      body={values.enableProxy && <ProxyInputFields />}
                    />

                    {/* NTP Configuration */}
                    <CheckboxField
                      label={t('ai:Add your own NTP (Network Time Protocol) sources')}
                      name="enableNtpSources"
                      helperText={
                        <p>
                          {t(
                            'ai:Configure your own NTP sources to synchronize the time between the hosts that will be added to this infrastructure environment.',
                          )}
                        </p>
                      }
                      body={
                        values.enableNtpSources && (
                          <Grid hasGutter>
                            <AdditionalNTPSourcesField
                              name="additionalNtpSources"
                              helperText={t(
                                'ai:A comma separated list of IP or domain names of the NTP pools or servers.',
                              )}
                            />
                          </Grid>
                        )
                      }
                    />

                    {/* Network Configuration */}
                    <HostsNetworkConfigurationControlGroup
                      clusterExists={false}
                      isDisabled={false}
                    />
                  </Form>
                </GridItem>
              </Grid>
            </WithErrorBoundary>
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default OptionalConfigurationsStep;
