import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';
import { ClusterWizardStepHeader, getFormikErrorFields, useAlerts } from '../../../common';
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import {
  ClusterDeploymentHostsDiscoveryStepProps,
  ClusterDeploymentHostsDiscoveryValues,
} from './types';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';
import { isAgentOfInfraEnv } from './helpers';

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

export const useHostsDiscoveryFormik = ({
  agents,
  agentClusterInstall,
}: UseHostsDiscoveryFormikArgs): [ClusterDeploymentHostsDiscoveryValues, Yup.Lazy] => {
  const initialValues = React.useMemo(
    () => getInitialValues({ agents, agentClusterInstall }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const validationSchema = React.useMemo(() => getValidationSchema(), []);

  return [initialValues, validationSchema];
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

  const [initialValues, validationSchema] = useHostsDiscoveryFormik({
    agents: infraEnvAgents,
    agentClusterInstall,
  });

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
      {({ submitForm, isSubmitting, isValid, isValidating, errors, touched }) => {
        const footer = (
          <ClusterDeploymentWizardFooter
            agentClusterInstall={agentClusterInstall}
            agents={infraEnvAgents}
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onNext={submitForm}
            onBack={() => setCurrentStepId('cluster-details')}
            onCancel={onClose}
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
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
