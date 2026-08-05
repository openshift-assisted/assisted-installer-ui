import React from 'react';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
} from '../../../types';
import { getAgentSelectorFieldsFromAnnotations } from '../../helpers';
import { AgentRoleCounts, ClusterDeploymentHostsSelectionValues } from '../types';
import { getAgentRoleCounts, provisionRequirementsSatisfied } from './utils';

const getInitialValues = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
}): ClusterDeploymentHostsSelectionValues => {
  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const hostCount =
    (agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents || 0) +
    (agentClusterInstall?.spec?.provisionRequirements?.arbiterAgents || 0) +
    (agentClusterInstall?.spec?.provisionRequirements?.workerAgents || 0);

  const agentSelector = getAgentSelectorFieldsFromAnnotations(
    clusterDeployment?.metadata?.annotations,
  );

  const selectedHosts = agents.filter(
    (agent) =>
      agent.spec?.clusterDeploymentName?.name === cdName &&
      agent.spec?.clusterDeploymentName?.namespace === cdNamespace,
  );

  const selectedIds = selectedHosts.map((agent) => agent.metadata?.uid as string);
  const autoSelectHosts = agentSelector.autoSelect;

  return {
    autoSelectHosts,
    hostCount,
    agentLabels: agentSelector?.labels || [],
    locations: agentSelector?.locations || [],
    selectedHostIds: selectedIds,
    autoSelectedHostIds: selectedIds,
    selectedRoleCounts: getAgentRoleCounts(selectedHosts),
  };
};

const getValidationSchema = (agentClusterInstall: AgentClusterInstallK8sResource, t: TFunction) =>
  Yup.object<ClusterDeploymentHostsSelectionValues>({
    selectedRoleCounts: Yup.mixed<AgentRoleCounts>().test(
      'sufficient-role-counts',
      agentClusterInstall.spec?.provisionRequirements.arbiterAgents
        ? t(
            "ai:The selected hosts do not satisfy this cluster's requirements ({{count}} control plane node, 1 arbiter).",
            {
              count: agentClusterInstall.spec?.provisionRequirements.controlPlaneAgents || 0,
            },
          )
        : t(
            "ai:The selected hosts do not satisfy this cluster's requirements ({{count}} control plane node).",
            {
              count: agentClusterInstall.spec?.provisionRequirements.controlPlaneAgents || 0,
            },
          ),
      (value) =>
        value &&
        provisionRequirementsSatisfied(value, agentClusterInstall.spec?.provisionRequirements),
    ),
  });

type UseHostsSelectionFormikArgs = {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  t: TFunction;
};

export const useHostsSelectionFormik = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
  t,
}: UseHostsSelectionFormikArgs) => {
  const initialValues = React.useMemo(
    () => getInitialValues({ agents, clusterDeployment, agentClusterInstall }),
    [agentClusterInstall, agents, clusterDeployment],
  );

  const validationSchema = React.useMemo(
    () => getValidationSchema(agentClusterInstall, t),
    [agentClusterInstall, t],
  );

  return { initialValues, validationSchema };
};
