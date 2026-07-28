import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { AlertVariant } from '@patternfly/react-core';
import { Form, Grid, GridItem, Content } from '@patternfly/react-core';
import {
  ClusterWizardStep,
  PullSecret,
  UploadSSH,
  handleApiError,
  getApiErrorMessage,
  isInOcm,
  pullSecretValidationSchema,
  sshPublicKeyValidationSchema,
  useAlerts,
  useTranslation,
} from '../../../../common';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { InfraEnvsAPI, ClustersAPI } from '../../../services/apis';
import { ImageType } from '@openshift-assisted/types/assisted-installer-service';
import usePullSecret from '../../../hooks/usePullSecret';
import { DISCONNECTED_OPENSHIFT_VERSION } from './BasicStep';

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

const OptionalConfigurationsStep = () => {
  const { t } = useTranslation();
  const {
    moveNext,
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
