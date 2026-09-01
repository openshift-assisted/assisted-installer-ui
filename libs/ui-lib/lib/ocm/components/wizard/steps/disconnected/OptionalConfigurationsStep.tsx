import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { AlertVariant, Form, Grid, GridItem, Content } from '@patternfly/react-core';
import {
  Cluster,
  InfraEnv,
  InfraEnvUpdateParams,
  ImageType,
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
  ClustersAPI,
  handleApiError,
  getApiErrorMessage,
  useTranslation,
  InputField,
  ipValidationSchema,
  getFormikErrorFields,
} from '../../../../../common';
import { usePullSecret } from '../../../../hooks';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { DISCONNECTED_OPENSHIFT_VERSION } from './BasicStep';
import { HostsNetworkConfigurationControlGroup } from '../clusterDetails/fields/HostsNetworkConfigurationControlGroup';
import { HostsNetworkConfigurationType } from '../../../../services/types';
import { getDummyInfraEnvField, isDummyYaml } from '../staticIp/data/dummyData';

const DISCONNECTED_IMAGE_TYPE: ImageType = 'disconnected-iso';
const DISCONNECTED_CLUSTER_NAME = 'disconnected-cluster';

type OptionalConfigurationsValues = {
  sshPublicKey: string;
  pullSecret: string;
  rendezvousIp: string;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
};

type OptionalConfigurationsFormProps = {
  defaultPullSecret?: string;
  isSubmitting: boolean;
};

const OptionalConfigurationsForm: React.FC<OptionalConfigurationsFormProps> = ({
  defaultPullSecret,
  isSubmitting,
}) => {
  const { moveBack } = useClusterWizardContext();
  const { isValid, submitForm, errors, touched } = useFormikContext<OptionalConfigurationsValues>();
  const errorFields = getFormikErrorFields(errors, touched);

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
              <UploadSSH />
              {!isInOcm && <PullSecret isOcm={false} defaultPullSecret={defaultPullSecret} />}
              <HostsNetworkConfigurationControlGroup clusterExists={false} isDisabled={false} />
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

const shouldSendDummyStaticConfig = (
  values: OptionalConfigurationsValues,
  infraEnv: InfraEnv | undefined,
): boolean =>
  values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC &&
  (!infraEnv?.staticNetworkConfig ||
    (typeof infraEnv.staticNetworkConfig === 'string' &&
      isDummyYaml(infraEnv.staticNetworkConfig)));

const buildInfraEnvUpdateParams = (
  values: OptionalConfigurationsValues,
  disconnectedInfraEnv: InfraEnv | undefined,
): InfraEnvUpdateParams => ({
  sshAuthorizedKey: values.sshPublicKey,
  rendezvousIp: values.rendezvousIp,
  staticNetworkConfig: shouldSendDummyStaticConfig(values, disconnectedInfraEnv)
    ? getDummyInfraEnvField()
    : [],
});

export const OptionalConfigurationsStep = () => {
  const { t } = useTranslation();
  const {
    moveNext,
    wizardStepIds,
    disconnectedCluster,
    setDisconnectedCluster,
    disconnectedInfraEnv,
    setDisconnectedInfraEnv,
  } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const defaultPullSecret = usePullSecret();

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        sshPublicKey: sshPublicKeyValidationSchema(t),
        pullSecret: isInOcm ? Yup.string() : pullSecretValidationSchema(t),
        rendezvousIp: Yup.string()
          .max(45, 'IP address must be at most 45 characters')
          .concat(ipValidationSchema(t)),
      }),
    [t],
  );

  const initialValues: OptionalConfigurationsValues = {
    sshPublicKey: disconnectedInfraEnv?.sshAuthorizedKey ?? '',
    pullSecret: defaultPullSecret ?? '',
    rendezvousIp: disconnectedInfraEnv?.rendezvousIp ?? '',
    hostsNetworkConfigurationType: wizardStepIds.some((id) => id.startsWith('static-ip'))
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP,
  };

  const handleNext = React.useCallback(
    async (values: OptionalConfigurationsValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        const pullSecretToUse = isInOcm ? defaultPullSecret ?? '' : values.pullSecret;

        const clusterToUse: Cluster | undefined = disconnectedCluster;
        let infraEnvToUse: InfraEnv | undefined = disconnectedInfraEnv;

        if (!clusterToUse?.id || !infraEnvToUse?.id) {
          const { data: cluster } = await ClustersAPI.registerDisconnected({
            name: DISCONNECTED_CLUSTER_NAME,
            openshiftVersion: DISCONNECTED_OPENSHIFT_VERSION,
          });
          setDisconnectedCluster(cluster);

          const { data: createdInfraEnv } = await InfraEnvsAPI.register({
            name: 'disconnected-infra-env',
            pullSecret: pullSecretToUse,
            clusterId: cluster.id,
            imageType: DISCONNECTED_IMAGE_TYPE,
            openshiftVersion: DISCONNECTED_OPENSHIFT_VERSION,
            sshAuthorizedKey: values.sshPublicKey || undefined,
            rendezvousIp: values.rendezvousIp || undefined,
            staticNetworkConfig:
              values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC
                ? getDummyInfraEnvField()
                : undefined,
          });
          infraEnvToUse = createdInfraEnv;
        } else {
          const { data: updatedInfraEnv } = await InfraEnvsAPI.update(
            infraEnvToUse.id,
            buildInfraEnvUpdateParams(values, infraEnvToUse),
          );
          infraEnvToUse = updatedInfraEnv;
        }

        setDisconnectedInfraEnv(infraEnvToUse);
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
      disconnectedCluster,
      disconnectedInfraEnv,
      setDisconnectedCluster,
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
    >
      <OptionalConfigurationsForm
        defaultPullSecret={defaultPullSecret}
        isSubmitting={isSubmitting}
      />
    </Formik>
  );
};

export default OptionalConfigurationsStep;
