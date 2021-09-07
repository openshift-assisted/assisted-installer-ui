import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getFormikErrorFields, Host, useAlerts } from '../../../common';
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
import {
  getAgentSelectorFieldsFromAnnotations,
  getAgentStatus,
  getClusterDeploymentAgentReservedValue,
} from '../helpers';
import { RESERVED_AGENT_LABEL_KEY } from '../common';

const getInitialValues = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
}): ClusterDeploymentHostsSelectionValues => {
  const isSNOCluster = agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;

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
        agent.metadata?.labels?.[RESERVED_AGENT_LABEL_KEY] ===
        getClusterDeploymentAgentReservedValue(
          clusterDeployment.metadata?.namespace || '',
          clusterDeployment.metadata?.name || '',
        ),
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
  const isSNOCluster = agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;

  return Yup.lazy<ClusterDeploymentHostsSelectionValues>((values) => {
    return Yup.object<ClusterDeploymentHostsSelectionValues>().shape({
      hostCount: hostCountValidationSchema,
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

const LISTED_HOST_STATUSES: Host['status'][] = [
  'known',
  'insufficient',
  'pending-for-input',
  'discovering',
];

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onClose,
  onSaveHostsSelection,
  hostActions,
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const initialValues = React.useMemo(
    () => getInitialValues({ agents, clusterDeployment, agentClusterInstall }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const validationSchema = React.useMemo(() => getValidationSchema(agentClusterInstall), [
    agentClusterInstall,
  ]);

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const availableAgents = React.useMemo(
    () =>
      (agents || []).filter((agent) => {
        const [status] = getAgentStatus(agent);
        return (
          LISTED_HOST_STATUSES.includes(status) &&
          agent.spec.approved &&
          (Object.hasOwnProperty.call(agent.metadata?.labels, RESERVED_AGENT_LABEL_KEY)
            ? agent.metadata?.labels?.[RESERVED_AGENT_LABEL_KEY] ===
              getClusterDeploymentAgentReservedValue(cdNamespace || '', cdName || '')
            : true)
        );
      }),
    [agents, cdNamespace, cdName],
  );

  const next = () => setCurrentStepId('networking');
  const handleSubmit = async (values: ClusterDeploymentHostsSelectionValues) => {
    try {
      await onSaveHostsSelection(values);
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save host selection.',
        message: error,
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
            <ClusterDeploymentHostsSelection
              agentClusterInstall={agentClusterInstall}
              hostActions={hostActions}
              availableAgents={availableAgents}
            />
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentHostSelectionStep;
