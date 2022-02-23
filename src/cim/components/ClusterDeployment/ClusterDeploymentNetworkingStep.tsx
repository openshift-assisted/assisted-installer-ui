import React from 'react';
import { Formik } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';

import {
  getFormikErrorFields,
  useAlerts,
  ClusterWizardStepHeader,
  FormikAutoSave,
} from '../../../common';

import {
  ClusterDeploymentDetailsNetworkingProps,
  ClusterDeploymentNetworkingValues,
} from './types';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentNetworkingForm from './ClusterDeploymentNetworkingForm';
import { isAgentOfCluster, isCIMFlow } from './helpers';
import { useNetworkingFormik } from './use-networking-formik';
import { canNextFromNetworkingStep } from './wizardTransition';

const ClusterDeploymentNetworkingStep: React.FC<ClusterDeploymentDetailsNetworkingProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onSaveNetworking,
  onClose,
  onFinish,
  fetchInfraEnv,
  ...rest
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const clusterAgents = React.useMemo(
    () => agents.filter((a) => isAgentOfCluster(a, cdName, cdNamespace)),
    [agents, cdName, cdNamespace],
  );

  const {
    initialValues,
    validationSchema,
    sameProxies,
    infraEnvsError,
    infraEnvWithProxy,
    infraEnvsLoading,
  } = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents: clusterAgents,
    fetchInfraEnv,
  });

  const next = () => {
    // setCurrentStepId('something-next'); // TODO(mlibra): set the next step ID here
    onFinish(); // TODO(mlibra): just temporarily - the flow will continue
  };

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

  const onBack = () =>
    isCIMFlow(clusterDeployment)
      ? setCurrentStepId('hosts-selection')
      : setCurrentStepId('hosts-discovery');

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, isValidating, errors, touched, values }) => {
        const footer = (
          <ClusterDeploymentWizardFooter
            agentClusterInstall={agentClusterInstall}
            agents={clusterAgents}
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={
              !isValid ||
              isValidating ||
              isSubmitting ||
              !canNextFromNetworkingStep(agentClusterInstall, clusterAgents)
            }
            onBack={onBack}
            onNext={next}
            onCancel={onClose}
            requireProxy={
              !!infraEnvWithProxy &&
              !sameProxies &&
              (values.httpProxy === undefined || !!values.httpsProxy === undefined)
            }
            nextButtonText="Install cluster"
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>Networking</ClusterWizardStepHeader>
              </GridItem>
              <GridItem>
                <ClusterDeploymentNetworkingForm
                  clusterDeployment={clusterDeployment}
                  agentClusterInstall={agentClusterInstall}
                  agents={clusterAgents}
                  sameProxies={sameProxies}
                  infraEnvsError={infraEnvsError}
                  infraEnvWithProxy={infraEnvWithProxy}
                  infraEnvsLoading={infraEnvsLoading}
                  {...rest}
                />
              </GridItem>
            </Grid>
            <FormikAutoSave />
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentNetworkingStep;
