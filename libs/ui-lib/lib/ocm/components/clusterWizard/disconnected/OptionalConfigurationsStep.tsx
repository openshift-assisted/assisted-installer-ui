import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import {
  ClusterWizardStep,
  TechnologyPreview,
  FormikAutoSave,
  sshPublicKeyValidationSchema,
  getFormikErrorFields,
  httpProxyValidationSchema,
  noProxyValidationSchema,
  ipValidationSchema,
  InputField,
  CheckboxField,
  AdditionalNTPSourcesField,
  ProxyFieldsType,
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
import { InfraEnvsAPI } from '../../../services/apis';
import { useParams } from 'react-router-dom-v5-compat';
import ClustersService from '../../../services/ClustersService';
import {
  Cluster,
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import { HostsNetworkConfigurationControlGroup } from '../../clusterConfiguration/HostsNetworkConfigurationControlGroup';
import {
  getDummyInfraEnvField,
  isDummyYaml,
} from '../../clusterConfiguration/staticIp/data/dummyData';
import { HostsNetworkConfigurationType } from '../../../services/types';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { ntpSourceValidationSchema } from '../../../../common/validationSchemas/ntpValidation';

const DISCONNECTED_IMAGE_TYPE = 'disconnected-iso' as const;

type OptionalConfigurationsFormValues = ProxyFieldsType & {
  sshPublicKey?: string;
  enableNtpSources: boolean;
  additionalNtpSources?: string;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
  rendezvousIp?: string;
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
};

/**
 * Rehydrate form values from infraEnv when navigating back to this step.
 * hostsNetworkConfigurationType comes from context (UI-only); when not set, derive from infraEnv.staticNetworkConfig.
 */
const infraEnvToFormValues = (
  infraEnv: InfraEnv,
  hostsNetworkConfigurationType?: 'dhcp' | 'static',
): OptionalConfigurationsFormValues => {
  const networkType =
    hostsNetworkConfigurationType ?? (infraEnv.staticNetworkConfig ? 'static' : 'dhcp');
  return {
    ...DEFAULT_INITIAL_VALUES,
    sshPublicKey: infraEnv.sshAuthorizedKey ?? '',
    enableProxy: !!(infraEnv.proxy?.httpProxy || infraEnv.proxy?.httpsProxy),
    httpProxy: infraEnv.proxy?.httpProxy ?? '',
    httpsProxy: infraEnv.proxy?.httpsProxy ?? '',
    noProxy: infraEnv.proxy?.noProxy ?? '',
    enableNtpSources: !!infraEnv.additionalNtpSources,
    additionalNtpSources: infraEnv.additionalNtpSources ?? '',
    hostsNetworkConfigurationType:
      networkType === 'static'
        ? HostsNetworkConfigurationType.STATIC
        : HostsNetworkConfigurationType.DHCP,
    rendezvousIp: infraEnv.rendezvousIp ?? '',
  };
};

/** Only send dummy static config when Static is selected and no real config exists yet (avoid overwriting after Static IP step). */
const shouldSendDummyStaticConfig = (
  values: OptionalConfigurationsFormValues,
  infraEnv: InfraEnv | null,
): boolean =>
  values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC &&
  (!infraEnv?.staticNetworkConfig ||
    (typeof infraEnv.staticNetworkConfig === 'string' &&
      isDummyYaml(infraEnv.staticNetworkConfig)));

const buildInfraEnvParams = (
  values: OptionalConfigurationsFormValues,
  disconnectedInfraEnv: InfraEnv | null,
): InfraEnvUpdateParams => {
  const proxy = {
    ...(values.httpProxy && { httpProxy: values.httpProxy }),
    ...(values.httpsProxy && { httpsProxy: values.httpsProxy }),
    ...(values.noProxy && { noProxy: values.noProxy }),
  };
  return {
    ...(values.sshPublicKey && { sshAuthorizedKey: values.sshPublicKey }),
    ...(Object.keys(proxy).length > 0 && { proxy }),
    ...(values.additionalNtpSources && { additionalNtpSources: values.additionalNtpSources }),
    ...(values.rendezvousIp && { rendezvousIp: values.rendezvousIp }),
    ...(shouldSendDummyStaticConfig(values, disconnectedInfraEnv) && {
      staticNetworkConfig: getDummyInfraEnvField(),
    }),
  };
};

/** Merge saved form values into API response so they persist in context when navigating (API may omit some fields). */
const mergeFormValuesIntoInfraEnv = (
  updatedInfraEnv: InfraEnv,
  values: OptionalConfigurationsFormValues,
  openshiftVersion: string | undefined,
): InfraEnv => ({
  ...updatedInfraEnv,
  openshiftVersion,
  sshAuthorizedKey: values.sshPublicKey || undefined,
  proxy:
    values.enableProxy && (values.httpProxy || values.httpsProxy)
      ? {
          httpProxy: values.httpProxy || undefined,
          httpsProxy: values.httpsProxy || undefined,
          noProxy: values.noProxy || undefined,
        }
      : undefined,
  additionalNtpSources: values.additionalNtpSources || undefined,
  rendezvousIp: values.rendezvousIp || undefined,
});

const getValidationSchema = (t: TFunction) =>
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
    }),
  );

type OptionalConfigurationsStepFormProps = {
  clusterId: string | undefined;
  cluster: Cluster | null;
};

const OptionalConfigurationsStepForm = ({
  clusterId,
  cluster,
}: OptionalConfigurationsStepFormProps) => {
  const { t } = useTranslation();
  const { moveNext, moveBack, disconnectedInfraEnv } = useClusterWizardContext();
  const { isValid, errors, touched, isSubmitting, values } =
    useFormikContext<OptionalConfigurationsFormValues>();

  const errorFields = getFormikErrorFields(errors, touched);

  return (
    <>
      {cluster && disconnectedInfraEnv && <FormikAutoSave debounce={0} />}
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={
          <ClusterWizardFooter
            disconnectedClusterId={clusterId}
            onNext={moveNext}
            onBack={moveBack}
            isBackDisabled={isSubmitting}
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
                <HostsNetworkConfigurationControlGroup clusterExists={false} isDisabled={false} />
              </Form>
            </GridItem>
          </Grid>
        </WithErrorBoundary>
      </ClusterWizardStep>
    </>
  );
};

const OptionalConfigurationsStep = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  const [cluster, setCluster] = React.useState<Cluster | null>(null);
  const { t } = useTranslation();
  const {
    setDisconnectedInfraEnv,
    disconnectedInfraEnv,
    disconnectedHostsNetworkConfigurationType,
    setDisconnectedHostsNetworkConfigurationType,
  } = useClusterWizardContext();
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

  const initialValues = React.useMemo<OptionalConfigurationsFormValues>(
    () =>
      disconnectedInfraEnv
        ? infraEnvToFormValues(disconnectedInfraEnv, disconnectedHostsNetworkConfigurationType)
        : DEFAULT_INITIAL_VALUES,
    [disconnectedInfraEnv, disconnectedHostsNetworkConfigurationType],
  );

  const validationSchema = React.useMemo(() => getValidationSchema(t), [t]);

  const onSubmit = React.useCallback(
    async (values: OptionalConfigurationsFormValues) => {
      clearAlerts();
      if (!cluster?.id) {
        addAlert({
          title: t('ai:Missing cluster'),
          message: t('ai:Cluster must be created before configuring infrastructure environment'),
          variant: AlertVariant.danger,
        });
        return;
      }
      if (!disconnectedInfraEnv?.id) {
        addAlert({
          title: t('ai:Missing infrastructure environment'),
          message: t('ai:Infrastructure environment must be created in the Basic step first'),
          variant: AlertVariant.danger,
        });
        return;
      }
      const updateParams: InfraEnvUpdateParams = {
        ...buildInfraEnvParams(values, disconnectedInfraEnv),
        imageType: DISCONNECTED_IMAGE_TYPE,
      };
      try {
        const { data: updatedInfraEnv } = await InfraEnvsAPI.update(
          disconnectedInfraEnv.id,
          updateParams,
        );
        setDisconnectedInfraEnv(
          mergeFormValuesIntoInfraEnv(updatedInfraEnv, values, cluster.openshiftVersion),
        );
        setDisconnectedHostsNetworkConfigurationType(
          values.hostsNetworkConfigurationType as 'dhcp' | 'static',
        );
      } catch (error) {
        handleApiError(error, () => {
          addAlert({
            title: t('ai:Failed to update infrastructure environment'),
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      }
    },
    [
      clearAlerts,
      addAlert,
      t,
      cluster,
      disconnectedInfraEnv,
      setDisconnectedInfraEnv,
      setDisconnectedHostsNetworkConfigurationType,
    ],
  );

  return (
    <Formik
      initialValues={initialValues}
      validateOnMount
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <OptionalConfigurationsStepForm clusterId={clusterId} cluster={cluster} />
    </Formik>
  );
};

export default OptionalConfigurationsStep;
