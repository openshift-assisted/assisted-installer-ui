import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { Alert, AlertVariant, Form, Grid, GridItem, Content } from '@patternfly/react-core';
import {
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStep,
  WithErrorBoundary,
  UploadSSH,
  isInOcm,
  PullSecret,
  useAlerts,
  sshPublicKeyValidationSchema,
  pullSecretValidationSchema,
  InfraEnvsAPI,
  handleApiError,
  getApiErrorMessage,
  useTranslation,
  InputField,
  ipValidationSchema,
  getFormikErrorFields,
  httpProxyValidationSchema,
  httpsProxyValidationSchema,
  noProxyValidationSchema,
  ntpSourceValidationSchema,
  ProxyFields,
  NtpSourcesFields,
} from '../../../../../common';
import { usePullSecret } from '../../../../hooks';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { HostsNetworkConfigurationType } from '../../../../services/types';
import { getDummyInfraEnvField } from '../staticIp/data/dummyData';
import {
  canonicalizeIp,
  getHostIpsFromInfraEnv,
  getStaticNetworkConfig,
} from '../staticIp/data/fromInfraEnv';

type OptionalConfigurationsValues = {
  sshPublicKey: string;
  pullSecret: string;
  rendezvousIp: string;
  enableProxy: boolean;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  enableNtpSources: boolean;
  ntpSourcesList: string;
};

type OptionalConfigurationsFormProps = {
  defaultPullSecret?: string;
  isSubmitting: boolean;
};

const isRendezvousIpInStaticHostList = (
  rendezvousIp: string | undefined,
  infraEnv: InfraEnv | undefined,
): boolean => {
  if (!rendezvousIp?.trim()) {
    return true;
  }
  const staticHostIps = getHostIpsFromInfraEnv(infraEnv);
  if (!staticHostIps.length) {
    return true;
  }
  const canonicalRendezvousIp = canonicalizeIp(rendezvousIp.trim());
  return staticHostIps.some((ip) => canonicalizeIp(ip) === canonicalRendezvousIp);
};

const OptionalConfigurationsForm: React.FC<OptionalConfigurationsFormProps> = ({
  defaultPullSecret,
  isSubmitting,
}) => {
  const { moveBack, disconnectedInfraEnv, hostsNetworkConfigurationType } =
    useClusterWizardContext();
  const { isValid, submitForm, errors, touched, values } =
    useFormikContext<OptionalConfigurationsValues>();
  const errorFields = getFormikErrorFields(errors, touched);

  const showRendezvousIpMismatchWarning =
    hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC &&
    !!values.rendezvousIp.trim() &&
    !isRendezvousIpInStaticHostList(values.rendezvousIp, disconnectedInfraEnv);

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          onBack={moveBack}
          isSubmitting={isSubmitting}
          isNextDisabled={!isValid}
          errorFields={errorFields}
        />
      }
    >
      <WithErrorBoundary title="Failed to load Optional configurations step">
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Optional configurations</Content>
          </GridItem>
          <GridItem>
            <Form id="wizard-cluster-optional-config__form">
              <InputField
                label="Rendezvous IP"
                name="rendezvousIp"
                helperText="The IP address that hosts will use to communicate with the bootstrap node during installation."
                maxLength={45}
              />
              {showRendezvousIpMismatchWarning && (
                <Alert
                  isInline
                  variant="warning"
                  title="Rendezvous IP does not match a configured static IP"
                >
                  The rendezvous IP does not match any of the configured static IP addresses. The
                  installation may fail if the rendezvous IP is unreachable.
                </Alert>
              )}
              <UploadSSH />
              {!isInOcm && !disconnectedInfraEnv?.pullSecretSet && (
                <PullSecret isOcm={false} defaultPullSecret={defaultPullSecret} />
              )}
              <ProxyFields />
              <NtpSourcesFields />
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

const getStaticNetworkConfigUpdate = (
  hostsNetworkConfigurationType: HostsNetworkConfigurationType,
  infraEnv: InfraEnv,
) => {
  if (hostsNetworkConfigurationType === HostsNetworkConfigurationType.DHCP) {
    return [];
  }
  if (!infraEnv.staticNetworkConfig) {
    return getDummyInfraEnvField();
  }
  return getStaticNetworkConfig(infraEnv) ?? getDummyInfraEnvField();
};

const buildInfraEnvUpdateParams = (
  values: OptionalConfigurationsValues,
  disconnectedInfraEnv: InfraEnv,
  hostsNetworkConfigurationType: HostsNetworkConfigurationType,
  pullSecretToUse: string,
): InfraEnvUpdateParams => ({
  sshAuthorizedKey: values.sshPublicKey,
  rendezvousIp: values.rendezvousIp,
  staticNetworkConfig: getStaticNetworkConfigUpdate(
    hostsNetworkConfigurationType,
    disconnectedInfraEnv,
  ),
  proxy: {
    httpProxy: values.httpProxy,
    httpsProxy: values.httpsProxy,
    noProxy: values.noProxy,
  },
  ntpSources: values.enableNtpSources ? values.ntpSourcesList : '',
  ...(!isInOcm && pullSecretToUse ? { pullSecret: pullSecretToUse } : {}),
});

export const OptionalConfigurationsStep = () => {
  const { t } = useTranslation();
  const { moveNext, disconnectedInfraEnv, setDisconnectedInfraEnv, hostsNetworkConfigurationType } =
    useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const defaultPullSecret = usePullSecret();

  const validationSchema = React.useMemo(
    () =>
      Yup.lazy((values: OptionalConfigurationsValues) =>
        Yup.object({
          sshPublicKey: sshPublicKeyValidationSchema(t),
          pullSecret: isInOcm ? Yup.string() : pullSecretValidationSchema(t),
          rendezvousIp: Yup.string()
            .max(45, 'IP address must be at most 45 characters')
            .concat(ipValidationSchema(t)),
          httpProxy: httpProxyValidationSchema({
            values,
            pairValueName: 'httpsProxy',
            allowEmpty: true,
            t,
          }),
          httpsProxy: httpsProxyValidationSchema({
            values,
            pairValueName: 'httpProxy',
            allowEmpty: true,
            t,
          }),
          noProxy: noProxyValidationSchema(t),
          ntpSourcesList: values.enableNtpSources
            ? ntpSourceValidationSchema(t, false)
            : ntpSourceValidationSchema(t),
        }),
      ),
    [t],
  );

  const initialValues: OptionalConfigurationsValues = {
    sshPublicKey: disconnectedInfraEnv?.sshAuthorizedKey ?? '',
    pullSecret: defaultPullSecret ?? '',
    rendezvousIp: disconnectedInfraEnv?.rendezvousIp ?? '',
    enableProxy: !!(
      disconnectedInfraEnv?.proxy?.httpProxy ||
      disconnectedInfraEnv?.proxy?.httpsProxy ||
      disconnectedInfraEnv?.proxy?.noProxy
    ),
    httpProxy: disconnectedInfraEnv?.proxy?.httpProxy ?? '',
    httpsProxy: disconnectedInfraEnv?.proxy?.httpsProxy ?? '',
    noProxy: disconnectedInfraEnv?.proxy?.noProxy ?? '',
    enableNtpSources: !!disconnectedInfraEnv?.ntpSources?.trim(),
    ntpSourcesList: disconnectedInfraEnv?.ntpSources ?? '',
  };

  const handleNext = React.useCallback(
    async (values: OptionalConfigurationsValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        if (!disconnectedInfraEnv?.id) {
          throw new Error('No disconnected infraEnv available');
        }

        const pullSecretToUse = isInOcm ? defaultPullSecret ?? '' : values.pullSecret;
        const { data: updatedInfraEnv } = await InfraEnvsAPI.update(
          disconnectedInfraEnv.id,
          buildInfraEnvUpdateParams(
            values,
            disconnectedInfraEnv,
            hostsNetworkConfigurationType,
            pullSecretToUse,
          ),
        );
        setDisconnectedInfraEnv(updatedInfraEnv);
        moveNext();
      } catch (error) {
        handleApiError(error, () => {
          addAlert({
            title: 'Failed to save optional configurations',
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      clearAlerts,
      defaultPullSecret,
      disconnectedInfraEnv,
      hostsNetworkConfigurationType,
      setDisconnectedInfraEnv,
      addAlert,
      moveNext,
    ],
  );

  return (
    <Formik<OptionalConfigurationsValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => void handleNext(values)}
      enableReinitialize
    >
      <OptionalConfigurationsForm
        defaultPullSecret={defaultPullSecret}
        isSubmitting={isSubmitting}
      />
    </Formik>
  );
};

export default OptionalConfigurationsStep;
