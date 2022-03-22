import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';
import { ClusterWizardStepHeader, useAlerts } from '../../../common';
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import {
  ClusterDeploymentHostsDiscoveryStepProps,
  ClusterDeploymentHostsDiscoveryValues,
} from './types';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';
import { isAgentOfInfraEnv } from './helpers';
import { canNextFromHostDiscoveryStep } from './wizardTransition';

type UseHostsDiscoveryFormikArgs = {
  agents: AgentK8sResource[];
  agentClusterInstall: AgentClusterInstallK8sResource;
};

const getInitialValues = ({
  agentClusterInstall,
  agents,
}: UseHostsDiscoveryFormikArgs): ClusterDeploymentHostsDiscoveryValues => {
  agentClusterInstall;
  agents;

  return {
    /* TODO(mlibra): CNS, OCS */
  };
};

const getValidationSchema = () => {
  return Yup.object<ClusterDeploymentHostsDiscoveryValues>().shape({
    /* TODO(mlibra): CNS, OCS */
  });
};

const ClusterDeploymentHostsDiscoveryStep: React.FC<ClusterDeploymentHostsDiscoveryStepProps> = ({
  onClose,
  onSaveHostsDiscovery,
  agentClusterInstall,
  agents: allAgents,
  infraEnv,
  ...restProps
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const infraEnvAgents = React.useMemo(
    () => allAgents.filter((a) => isAgentOfInfraEnv(infraEnv, a)),
    [allAgents, infraEnv],
  );

  const [initialValues, validationSchema] = React.useMemo(
    () => [
      getInitialValues({ agents: infraEnvAgents, agentClusterInstall }),
      getValidationSchema(),
    ],
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSubmit = async (values: ClusterDeploymentHostsDiscoveryValues) => {
    try {
      await onSaveHostsDiscovery(values);
      setCurrentStepId('networking');
    } catch (error) {
      addAlert({
        title: 'Failed to save host discovery selections.',
        message: error.message as string,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, isValidating }) => {
        const isNextDisabled =
          !isValid ||
          isValidating ||
          isSubmitting ||
          !canNextFromHostDiscoveryStep(agentClusterInstall, infraEnvAgents);
        const footer = (
          <ClusterDeploymentWizardFooter
            agentClusterInstall={agentClusterInstall}
            agents={infraEnvAgents}
            isSubmitting={isSubmitting}
            isNextDisabled={isNextDisabled}
            onNext={submitForm}
            onBack={() => setCurrentStepId('cluster-details')}
            onCancel={onClose}
          />
        );

        return (
          <ClusterDeploymentWizardStep footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>Cluster hosts</ClusterWizardStepHeader>
              </GridItem>
              <GridItem>
                <ClusterDeploymentHostsDiscovery
                  agentClusterInstall={agentClusterInstall}
                  agents={infraEnvAgents}
                  infraEnv={infraEnv}
                  {...restProps}
                />
              </GridItem>
            </Grid>
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentHostsDiscoveryStep;
