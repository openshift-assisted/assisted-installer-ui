import React from 'react';
import { Formik, useFormikContext } from 'formik';
import { Alert, AlertVariant, Grid, GridItem } from '@patternfly/react-core';

import {
  useAlerts,
  ClusterWizardStepHeader,
  FormikAutoSave,
  getFormikErrorFields,
  CLUSTER_FIELD_LABELS,
} from '../../../common';

import {
  ClusterDeploymentDetailsNetworkingProps,
  ClusterDeploymentNetworkingValues,
} from './types';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentNetworkingForm from './ClusterDeploymentNetworkingForm';
import { isAgentOfCluster, isCIMFlow } from './helpers';
import { useInfraEnvProxies, useNetworkingFormik } from './use-networking-formik';
import { canNextFromNetworkingStep } from './wizardTransition';
import { AgentK8sResource } from '../../types';

type NetworkingFormProps = {
  clusterDeployment: ClusterDeploymentDetailsNetworkingProps['clusterDeployment'];
  agentClusterInstall: ClusterDeploymentDetailsNetworkingProps['agentClusterInstall'];
  onClose: ClusterDeploymentDetailsNetworkingProps['onClose'];
  agents: AgentK8sResource[];
  fetchInfraEnv: ClusterDeploymentDetailsNetworkingProps['fetchInfraEnv'];
  hostActions: ClusterDeploymentDetailsNetworkingProps['hostActions'];
  isPreviewOpen: ClusterDeploymentDetailsNetworkingProps['isPreviewOpen'];
};

const NetworkingForm: React.FC<NetworkingFormProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onClose,
  fetchInfraEnv,
  hostActions,
  isPreviewOpen,
}) => {
  const [showFormErrors, setShowFormErrors] = React.useState(false);
  const [showClusterErrors, setShowClusterErrors] = React.useState(false);
  const [nextRequested, setNextRequested] = React.useState(false);
  const { infraEnvWithProxy, infraEnvsError, infraEnvsLoading, sameProxies } = useInfraEnvProxies({
    fetchInfraEnv,
    agents,
  });
  const {
    isValid,
    isValidating,
    isSubmitting,
    validateForm,
    setTouched,
    errors,
    touched,
    values,
  } = useFormikContext<ClusterDeploymentNetworkingValues>();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const canContinue = canNextFromNetworkingStep(agentClusterInstall, agents);

  const onBack = () =>
    isCIMFlow(clusterDeployment)
      ? setCurrentStepId('hosts-selection')
      : setCurrentStepId('hosts-discovery');

  const onNext = async () => {
    if (!showFormErrors) {
      const errors = await validateForm();
      setTouched(
        Object.keys(errors).reduce((acc, curr) => {
          acc[curr] = true;
          return acc;
        }, {}),
      );
      setShowFormErrors(true);
      if (Object.keys(errors).length) {
        return;
      }
    }
    setNextRequested(true);
  };

  React.useEffect(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
  }, [values.apiVip, values.ingressVip]);

  React.useEffect(() => {
    if (nextRequested) {
      setShowClusterErrors(true);
      if (canContinue) {
        setCurrentStepId('review');
      }
    }
  }, [nextRequested, canContinue, setCurrentStepId]);

  const errorFields = getFormikErrorFields(errors, touched);

  const footer = (
    <ClusterDeploymentWizardFooter
      agentClusterInstall={agentClusterInstall}
      agents={agents}
      isSubmitting={isSubmitting}
      isNextDisabled={
        nextRequested || isSubmitting || (showFormErrors ? !isValid || isValidating : false)
      }
      showClusterErrors={!errorFields.length && showClusterErrors}
      onBack={onBack}
      onNext={onNext}
      onCancel={onClose}
      nextButtonText="Next"
    >
      {showFormErrors && !!errorFields.length && (
        <Alert
          variant={AlertVariant.danger}
          title="Provided cluster configuration is not valid"
          isInline
        >
          The following fields are invalid or missing:{' '}
          {errorFields.map((field: string) => CLUSTER_FIELD_LABELS[field] || field).join(', ')}.
        </Alert>
      )}
    </ClusterDeploymentWizardFooter>
  );

  return (
    <ClusterDeploymentWizardStep footer={footer}>
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>Networking</ClusterWizardStepHeader>
        </GridItem>
        <GridItem>
          <ClusterDeploymentNetworkingForm
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            sameProxies={sameProxies}
            infraEnvsError={infraEnvsError}
            infraEnvWithProxy={infraEnvWithProxy}
            infraEnvsLoading={infraEnvsLoading}
            hostActions={hostActions}
            isPreviewOpen={isPreviewOpen}
          />
        </GridItem>
      </Grid>
      <FormikAutoSave />
    </ClusterDeploymentWizardStep>
  );
};

const ClusterDeploymentNetworkingStep: React.FC<ClusterDeploymentDetailsNetworkingProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onSaveNetworking,
  ...rest
}) => {
  const { addAlert } = useAlerts();

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const clusterAgents = React.useMemo(
    () => agents.filter((a) => isAgentOfCluster(a, cdName, cdNamespace)),
    [agents, cdName, cdNamespace],
  );

  const { initialValues, validationSchema } = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents: clusterAgents,
  });

  const handleSubmit = async (values: ClusterDeploymentNetworkingValues) => {
    try {
      await onSaveNetworking(values);
    } catch (error) {
      addAlert({
        title: 'Failed to save ClusterDeployment',
        message: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <NetworkingForm
        {...rest}
        agents={clusterAgents}
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
      />
    </Formik>
  );
};

export default ClusterDeploymentNetworkingStep;
