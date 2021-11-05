import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';
import { ClusterWizardStepHeader, getFormikErrorFields, useAlerts } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import {
  ClusterDeploymentHostsDiscoveryStepProps,
  ClusterDeploymentHostsDiscoveryValues,
} from './types';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';

type UseHostsDiscoveryFormikArgs = {
  agents: AgentK8sResource[];
  // clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
};

const getInitialValues = ({
  agentClusterInstall,
  // clusterDeployment,
  agents,
}: UseHostsDiscoveryFormikArgs): ClusterDeploymentHostsDiscoveryValues => {
  agentClusterInstall;
  // clusterDeployment;
  agents;
  // const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  // const cdName = clusterDeployment?.metadata?.name;
  // const cdNamespace = clusterDeployment?.metadata?.namespace;

  // const agentSelector = getAgentSelectorFieldsFromAnnotations(
  //   clusterDeployment?.metadata?.annotations,
  // );

  // const selectedIds = agents
  //   .filter(
  //     (agent) =>
  //       agent.spec?.clusterDeploymentName?.name === cdName &&
  //       agent.spec?.clusterDeploymentName?.namespace === cdNamespace,
  //   )
  //   .map((agent) => agent.metadata?.uid as string);
  // const autoSelectHosts = agentSelector.autoSelect;

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
  // clusterDeployment,
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
  // clusterDeployment,
  agentClusterInstall,
  agents,
  ...restProps
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const [initialValues, validationSchema] = useHostsDiscoveryFormik({
    agents,
    // clusterDeployment,
    agentClusterInstall,
  });

  const next = () => setCurrentStepId('networking');
  const handleSubmit = async (values: ClusterDeploymentHostsDiscoveryValues) => {
    try {
      if (onSaveHostsDiscovery) {
        await onSaveHostsDiscovery(values);
      }
      next();
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
      {({ submitForm, isSubmitting, isValid, isValidating, dirty, errors, touched }) => {
        const handleOnNext = () => {
          if (dirty) {
            submitForm();
          } else {
            next();
          }
        };

        const footer = (
          <ClusterDeploymentWizardFooter
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onNext={handleOnNext}
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
                  // clusterDeployment={clusterDeployment}
                  agentClusterInstall={agentClusterInstall}
                  agents={agents}
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
