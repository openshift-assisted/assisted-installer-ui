import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { AlertVariant } from '@patternfly/react-core';
import { Form, Grid, GridItem, Content } from '@patternfly/react-core';
import { ImageType } from '@openshift-assisted/types/assisted-installer-service';
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
} from '../../../../../common';
import { usePullSecret } from '../../../../hooks';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';

const DISCONNECTED_IMAGE_TYPE: ImageType = 'disconnected-iso';
const DISCONNECTED_CLUSTER_NAME = 'disconnected-cluster';

type OptionalConfigurationsValues = {
  sshPublicKey: string;
  pullSecret: string;
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
  const { isValid, submitForm } = useFormikContext<OptionalConfigurationsValues>();

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          onBack={moveBack}
          isSubmitting={isSubmitting}
          isNextDisabled={!isValid}
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
              <UploadSSH />
              {!isInOcm && <PullSecret isOcm={false} defaultPullSecret={defaultPullSecret} />}
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const OptionalConfigurationsStep = () => {
  const { t } = useTranslation();
  const {
    moveNext,
    disconnectedCluster,
    setDisconnectedCluster,
    disconnectedInfraEnv,
    setDisconnectedInfraEnv,
    disconnectedOpenshiftVersion,
  } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const defaultPullSecret = usePullSecret();

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        sshPublicKey: sshPublicKeyValidationSchema(t),
        pullSecret: isInOcm ? Yup.string() : pullSecretValidationSchema(t),
      }),
    [t],
  );

  const initialValues: OptionalConfigurationsValues = {
    sshPublicKey: disconnectedInfraEnv?.sshAuthorizedKey ?? '',
    pullSecret: defaultPullSecret ?? '',
  };

  const handleNext = React.useCallback(
    async (values: OptionalConfigurationsValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        const pullSecretToUse = isInOcm ? defaultPullSecret ?? '' : values.pullSecret;

        if (disconnectedCluster?.id && disconnectedInfraEnv?.id) {
          const { data: updatedInfraEnv } = await InfraEnvsAPI.update(disconnectedInfraEnv.id, {
            sshAuthorizedKey: values.sshPublicKey,
          });
          setDisconnectedInfraEnv(updatedInfraEnv);
        } else {
          const { data: cluster } = await ClustersAPI.registerDisconnected({
            name: DISCONNECTED_CLUSTER_NAME,
            openshiftVersion: disconnectedOpenshiftVersion,
          });
          setDisconnectedCluster(cluster);

          const { data: createdInfraEnv } = await InfraEnvsAPI.register({
            name: 'disconnected-infra-env',
            pullSecret: pullSecretToUse,
            clusterId: cluster.id,
            imageType: DISCONNECTED_IMAGE_TYPE,
            openshiftVersion: disconnectedOpenshiftVersion,
            sshAuthorizedKey: values.sshPublicKey || undefined,
          });
          setDisconnectedInfraEnv(createdInfraEnv);
        }

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
      disconnectedOpenshiftVersion,
      setDisconnectedCluster,
      setDisconnectedInfraEnv,
      addAlert,
      moveNext,
    ],
  );

  return (
    <Formik<OptionalConfigurationsValues>
      initialValues={initialValues}
      enableReinitialize
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
