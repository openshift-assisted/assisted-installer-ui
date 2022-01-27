import React from 'react';
import { Formik } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';

import { getFormikErrorFields, useAlerts, ClusterWizardStepHeader } from '../../../common';

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

const ClusterDeploymentNetworkingStep: React.FC<ClusterDeploymentDetailsNetworkingProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  aiConfigMap,
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
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save ClusterDeployment',
        message: error,
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
      {({ submitForm, isSubmitting, isValid, isValidating, errors, touched, values }) => {
        const footer = (
          <ClusterDeploymentWizardFooter
            agentClusterInstall={agentClusterInstall}
            agents={clusterAgents}
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onBack={onBack}
            onNext={submitForm}
            onCancel={onClose}
            nextButtonText="Save and install"
            requireProxy={
              !!infraEnvWithProxy &&
              !sameProxies &&
              (values.httpProxy === undefined || !!values.httpsProxy === undefined)
            }
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>Networking</ClusterWizardStepHeader>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <ClusterDeploymentNetworkingForm
                  clusterDeployment={clusterDeployment}
                  agentClusterInstall={agentClusterInstall}
                  agents={clusterAgents}
                  aiConfigMap={aiConfigMap}
                  sameProxies={sameProxies}
                  infraEnvsError={infraEnvsError}
                  infraEnvWithProxy={infraEnvWithProxy}
                  infraEnvsLoading={infraEnvsLoading}
                  {...rest}
                />
              </GridItem>
            </Grid>
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentNetworkingStep;
