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
import ClusterDeploymentHostsSelection from './ClusterDeploymentHostsSelection';
import {
  ClusterDeploymentHostSelectionStepProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import { hostCountValidationSchema } from './validationSchemas';
import { getAgentSelectorFieldsFromAnnotations, getIsSNOCluster } from '../helpers';

const getInitialValues = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
}): ClusterDeploymentHostsSelectionValues => {
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  let hostCount =
    (agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents || 0) +
    (agentClusterInstall?.spec?.provisionRequirements?.workerAgents || 0);
  if (isSNOCluster) {
    hostCount = 1;
  } else if (hostCount === 2 || hostCount === 0) {
    hostCount = 3;
  } else if (hostCount === 4) {
    hostCount = 5;
  }

  const agentSelector = getAgentSelectorFieldsFromAnnotations(
    clusterDeployment?.metadata?.annotations,
  );

  const selectedIds = agents
    .filter(
      (agent) =>
        agent.spec?.clusterDeploymentName?.name === cdName &&
        agent.spec?.clusterDeploymentName?.namespace === cdNamespace,
    )
    .map((agent) => agent.metadata?.uid as string);
  const autoSelectHosts = agentSelector.autoSelect;

  return {
    autoSelectHosts,
    hostCount,
    useMastersAsWorkers: hostCount === 1 || hostCount === 3, // TODO: Recently not supported - https://issues.redhat.com/browse/MGMT-7677
    agentLabels: agentSelector?.labels || [],
    locations: agentSelector?.locations || [],
    selectedHostIds: autoSelectHosts ? [] : selectedIds,
    autoSelectedHostIds: autoSelectHosts ? selectedIds : [],
  };
};

const getValidationSchema = (agentClusterInstall: AgentClusterInstallK8sResource) => {
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);

  return Yup.lazy<ClusterDeploymentHostsSelectionValues>((values) => {
    return Yup.object<ClusterDeploymentHostsSelectionValues>().shape({
      hostCount: isSNOCluster ? Yup.number() : hostCountValidationSchema,
      useMastersAsWorkers: Yup.boolean().required(),
      autoSelectedHostIds: values.autoSelectHosts
        ? Yup.array<string>().min(values.hostCount)
        : Yup.array<string>(),
      selectedHostIds: values.autoSelectHosts
        ? Yup.array<string>()
        : Yup.array<string>().min(isSNOCluster ? 1 : values.selectedHostIds.length === 4 ? 5 : 3),
    });
  });
};

type UseHostsSelectionFormikArgs = {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
};

export const useHostsSelectionFormik = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: UseHostsSelectionFormikArgs): [ClusterDeploymentHostsSelectionValues, Yup.Lazy] => {
  const initialValues = React.useMemo(
    () => getInitialValues({ agents, clusterDeployment, agentClusterInstall }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const validationSchema = React.useMemo(() => getValidationSchema(agentClusterInstall), [
    agentClusterInstall,
  ]);

  return [initialValues, validationSchema];
};

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onClose,
  onSaveHostsSelection,
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const [initialValues, validationSchema] = useHostsSelectionFormik({
    agents,
    clusterDeployment,
    agentClusterInstall,
  });

  const next = () => setCurrentStepId('networking');
  const handleSubmit = async (values: ClusterDeploymentHostsSelectionValues) => {
    try {
      await onSaveHostsSelection(values);
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save host selection.',
        message: error as string,
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
                <ClusterDeploymentHostsSelection
                  agentClusterInstall={agentClusterInstall}
                  agents={agents}
                  clusterDeployment={clusterDeployment}
                />
              </GridItem>
            </Grid>
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentHostSelectionStep;
