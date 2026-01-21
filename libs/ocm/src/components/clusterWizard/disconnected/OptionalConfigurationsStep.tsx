import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import {
  ClusterWizardStep,
  TechnologyPreview,
  getRichTextValidation,
  sshPublicKeyValidationSchema,
  pullSecretValidationSchema,
  getFormikErrorFields,
} from '@openshift-assisted/common';
import { Split, SplitItem, Grid, GridItem, Form, Content, Checkbox } from '@patternfly/react-core';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '@openshift-assisted/common/components/ErrorHandling/WithErrorBoundary';
import UploadSSH from '@openshift-assisted/common/components/clusterConfiguration/UploadSSH';
import PullSecretField from '@openshift-assisted/common/components/ui/formik/PullSecretField';
import { isInOcm } from '@openshift-assisted/common/api/axiosClient';
import { handleApiError, getApiErrorMessage } from '@openshift-assisted/common/api/utils';
import { useAlerts } from '@openshift-assisted/common/components/AlertsContextProvider';
import { AlertVariant } from '@patternfly/react-core';
import InfraEnvsService from '../../../services/InfraEnvsService';
import { InfraEnvsAPI } from '../../../services/apis';
import usePullSecret from '../../../hooks/usePullSecret';
import { useParams } from 'react-router-dom-v5-compat';
import ClustersService from '../../../services/ClustersService';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

type OptionalConfigurationsFormValues = {
  sshPublicKey?: string;
  pullSecret?: string;
};

const PullSecretSync: React.FC<{ pullSecret?: string }> = ({ pullSecret }) => {
  const { setFieldValue } = useFormikContext<OptionalConfigurationsFormValues>();

  React.useEffect(() => {
    if (pullSecret !== undefined) {
      setFieldValue('pullSecret', pullSecret);
    }
  }, [pullSecret, setFieldValue]);

  return null;
};

const OptionalConfigurationsStep = () => {
  const pullSecret = usePullSecret() || '';
  const { clusterId } = useParams<{ clusterId: string }>();
  const [cluster, setCluster] = React.useState<Cluster | null>(null);

  const { moveNext, moveBack, setDisconnectedInfraEnv, disconnectedInfraEnv } =
    useClusterWizardContext();
  const { addAlert } = useAlerts();
  const [editPullSecret, setEditPullSecret] = React.useState(false);

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
            title: 'Failed to fetch cluster',
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      }
    };
    void fetchCluster();
  }, [clusterId, addAlert]);

  const validationSchema = React.useMemo(
    () =>
      Yup.object<OptionalConfigurationsFormValues>().shape({
        sshPublicKey: sshPublicKeyValidationSchema,
        pullSecret: pullSecretValidationSchema,
      }),
    [],
  );

  const initialValues: OptionalConfigurationsFormValues = {
    sshPublicKey: '',
    pullSecret: pullSecret,
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={getRichTextValidation<OptionalConfigurationsFormValues>(validationSchema)}
      onSubmit={async (values) => {
        if (!cluster || !cluster.id) {
          addAlert({
            title: 'Missing cluster',
            message: 'Cluster must be created before configuring infrastructure environment',
            variant: AlertVariant.danger,
          });
          return;
        }

        try {
          // Check if infraEnv already exists
          if (disconnectedInfraEnv && disconnectedInfraEnv.id) {
            // Update existing infraEnv
            const updateParams = {
              pullSecret: values.pullSecret || pullSecret,
              ...(values.sshPublicKey && { sshAuthorizedKey: values.sshPublicKey }),
            };
            const { data: updatedInfraEnv } = await InfraEnvsAPI.update(
              disconnectedInfraEnv.id,
              updateParams,
            );
            setDisconnectedInfraEnv(updatedInfraEnv);
            moveNext();
          } else {
            // Create infraEnv with all params
            const createParams = {
              name: `disconnected-cluster_infra-env`,
              pullSecret: values.pullSecret || pullSecret,
              clusterId: cluster.id,
              openshiftVersion: cluster.openshiftVersion,
              cpuArchitecture: 'x86_64' as const,
              ...(values.sshPublicKey && { sshAuthorizedKey: values.sshPublicKey }),
            };
            const createdInfraEnv = await InfraEnvsService.create(createParams);
            setDisconnectedInfraEnv(createdInfraEnv);
            moveNext();
          }
        } catch (error) {
          handleApiError(error, () => {
            addAlert({
              title:
                disconnectedInfraEnv && disconnectedInfraEnv.id
                  ? 'Failed to update infrastructure environment'
                  : 'Failed to create infrastructure environment',
              message: getApiErrorMessage(error),
              variant: AlertVariant.danger,
            });
          });
        }
      }}
    >
      {({ submitForm, isValid, errors, touched, isSubmitting }) => {
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
                isNextDisabled={!isValid}
                errorFields={errorFields}
                isSubmitting={isSubmitting}
              />
            }
          >
            <WithErrorBoundary title="Failed to load Optional Configurations step">
              <PullSecretSync pullSecret={pullSecret} />
              <Grid hasGutter>
                <GridItem>
                  <Split>
                    <SplitItem>
                      <Content component="h2">Optional configurations</Content>
                    </SplitItem>
                    <SplitItem>
                      <TechnologyPreview />
                    </SplitItem>
                  </Split>
                </GridItem>
                <GridItem>
                  <Form id="wizard-cluster-optional-configurations__form">
                    <UploadSSH />
                    <Checkbox
                      label="Edit pull secret"
                      isChecked={editPullSecret}
                      onChange={(_, checked) => setEditPullSecret(checked)}
                      id="edit-pull-secret-checkbox"
                    />
                    {(editPullSecret || !pullSecret) && <PullSecretField isOcm={isInOcm} />}
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
