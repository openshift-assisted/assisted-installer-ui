import React from 'react';
import * as Yup from 'yup';
import { TestOptionsMessage } from 'yup';
import { Formik, FormikHelpers } from 'formik';
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
import { canNextFromHostSelectionStep } from './wizardTransition';

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
    selectedHostIds: selectedIds,
    autoSelectedHostIds: selectedIds,
  };
};

const getMinHostsCount = (selectedHostsCount: number) => {
  if (selectedHostsCount === 0) {
    return 0;
  }
  return selectedHostsCount === 4 ? 5 : 3;
};

const getValidationSchema = (agentClusterInstall: AgentClusterInstallK8sResource) => {
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  const getMinMessage: TestOptionsMessage<{ min: number }> = ({ min }) => {
    const message = `Please select at least ${min} hosts for the cluster`;
    if (min === 5) {
      return message + ' or select just 3 hosts instead.';
    }
    return `${message}.`;
  };

  return Yup.lazy<ClusterDeploymentHostsSelectionValues>((values) => {
    return Yup.object<ClusterDeploymentHostsSelectionValues>().shape({
      hostCount: isSNOCluster ? Yup.number() : hostCountValidationSchema,
      useMastersAsWorkers: Yup.boolean().required(),
      autoSelectedHostIds: values.autoSelectHosts
        ? Yup.array<string>().min(values.hostCount).max(values.hostCount)
        : Yup.array<string>(),
      selectedHostIds: values.autoSelectHosts
        ? Yup.array<string>()
        : isSNOCluster
        ? Yup.array<string>()
            .min(0, 'Please select one host for the cluster.')
            .max(1, 'Please select one host for the cluster.') // TODO(jtomasek): replace this with Yup.array().length() after updating Yup
        : Yup.array<string>().min(getMinHostsCount(values.selectedHostIds.length), getMinMessage),
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
    [agentClusterInstall, agents, clusterDeployment],
  );

  const validationSchema = React.useMemo(() => getValidationSchema(agentClusterInstall), [
    agentClusterInstall,
  ]);

  return [initialValues, validationSchema];
};

const getSelectedAgents = (
  agents: AgentK8sResource[],
  values: ClusterDeploymentHostsSelectionValues,
) => {
  const selectedHostIds = values.autoSelectHosts
    ? values.autoSelectedHostIds
    : values.selectedHostIds;
  return agents.filter((agent) => selectedHostIds.includes(agent.metadata?.uid || ''));
};

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onClose,
  onSaveHostsSelection,
  aiConfigMap,
  hostActions,
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const [initialValues, validationSchema] = useHostsSelectionFormik({
    agents,
    clusterDeployment,
    agentClusterInstall,
  });

  const next = () => setCurrentStepId('networking');
  const handleSubmit = async (
    values: ClusterDeploymentHostsSelectionValues,
    formikHelpers: FormikHelpers<ClusterDeploymentHostsSelectionValues>,
  ) => {
    try {
      await onSaveHostsSelection(values);
      formikHelpers.resetForm({ values });
    } catch (error) {
      addAlert({
        title: 'Failed to save host selection.',
        message: error.message as string,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnMount
      enableReinitialize
    >
      {({ isSubmitting, isValid, isValidating, errors, touched, values }) => {
        const selectedAgents = getSelectedAgents(agents, values);
        const isNextDisabled =
          !isValid ||
          isValidating ||
          isSubmitting ||
          !canNextFromHostSelectionStep(agentClusterInstall, selectedAgents);

        const footer = (
          <ClusterDeploymentWizardFooter
            agentClusterInstall={agentClusterInstall}
            agents={selectedAgents}
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={isNextDisabled}
            onNext={next}
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
                  aiConfigMap={aiConfigMap}
                  hostActions={hostActions}
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
