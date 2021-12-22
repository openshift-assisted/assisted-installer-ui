import {
  AgentClusterInstallK8sResource,
  AgentClusterInstallStatusCondition,
  AgentClusterInstallStatusConditionType,
} from '../../types/k8s/agent-cluster-install';
import { Cluster, Host } from '../../../common';
import {
  AgentK8sResource,
  AgentStatusCondition,
  AgentStatusConditionType,
} from '../../types/k8s/agent';
import { StatusCondition, BareMetalHostK8sResource } from '../../types';
import { getFailingResourceConditions, REQUIRED_AGENT_CONDITION_TYPES } from './conditions';
import { Validation, ValidationsInfo } from '../../../common/types/hosts';
import { HostValidationId } from '../../../common/api/types';

const conditionsByTypeReducer = <K>(
  result: { K?: StatusCondition<string> },
  condition: StatusCondition<string>,
) => ({
  ...result,
  [condition.type]: condition,
});

export const getClusterStatusFromConditions = (
  agentClusterInstall: AgentClusterInstallK8sResource,
): [Cluster['status'], string] => {
  const conditions = agentClusterInstall?.status?.conditions || [];

  const conditionsByType: {
    [key in AgentClusterInstallStatusConditionType]?: AgentClusterInstallStatusCondition;
  } = conditions.reduce(conditionsByTypeReducer, {});

  const { Validated, RequirementsMet, Completed, Stopped } = conditionsByType;

  if (!Validated || !RequirementsMet || !Completed || !Stopped) {
    return ['insufficient', 'AgentClusterInstall conditions are missing.'];
  }

  if (Stopped.status === 'True' && Stopped.reason === 'InstallationCancelled')
    return ['cancelled', Stopped.message];
  if (Stopped.status === 'True' && Stopped.reason === 'InstallationFailed')
    return ['error', Stopped.message];
  if (Completed.status === 'True' && Completed.reason === 'InstallationCompleted')
    return ['installed', Completed.message];
  if (Completed.status === 'False' && Completed.reason === 'InstallationInProgress')
    return ['installing', Completed.message];
  if (Validated.status === 'False' && Validated.reason === 'ValidationsFailing')
    return ['insufficient', Validated.message];
  if (Validated.status === 'False' && Validated.reason === 'ValidationsUserPending')
    return ['pending-for-input', Validated.message];
  if (Validated.status === 'False' && Validated.reason === 'ValidationsUnknown')
    return ['insufficient', Validated.message];

  if (RequirementsMet.status === 'False' && RequirementsMet.reason === 'ClusterNotReady')
    return ['insufficient', RequirementsMet.message];
  if (RequirementsMet.status === 'False' && RequirementsMet.reason === 'InsufficientAgents')
    return ['insufficient', RequirementsMet.message];
  if (RequirementsMet.status === 'False' && RequirementsMet.reason === 'UnapprovedAgents')
    return ['insufficient', RequirementsMet.message];
  if (Completed.status === 'False' && Completed.reason === 'UnapprovedAgents')
    return ['insufficient', Completed.message];

  console.error('Unhandled conditions to cluster status mapping: ', conditionsByType);
  return ['insufficient', 'Unexpected AgentClusterInstall conditions.'];
};

export const getClusterStatus = (
  agentClusterInstall?: AgentClusterInstallK8sResource,
): [Cluster['status'], Cluster['statusInfo']] => {
  const { state: status, stateInfo: statusInfo } = agentClusterInstall?.status?.debugInfo || {};
  return [status || 'insufficient', statusInfo || ''];
};

export const isDraft = (agentClusterInstall?: AgentClusterInstallK8sResource): boolean =>
  !!agentClusterInstall &&
  ['pending-for-input', 'insufficient', 'ready'].includes(getClusterStatus(agentClusterInstall)[0]);

export const getAgentStatusFromConditions = (agent: AgentK8sResource): [Host['status'], string] => {
  const conditions = agent.status?.conditions;

  const conditionsByType: {
    [key in AgentStatusConditionType]?: AgentStatusCondition;
  } = (conditions || []).reduce(conditionsByTypeReducer, {});

  const { Installed, Connected, ReadyForInstallation } = conditionsByType;

  if (Installed?.status === 'True') return ['installed', Installed.message];
  if (Installed?.status === 'False' && Installed.reason === 'InstallationFailed')
    return ['error', Installed.message];
  if (Installed?.status === 'False' && Installed?.reason === 'InstallationInProgress')
    return ['installing', Installed?.message];
  if (Connected?.status === 'False') return ['disconnected', Connected.message];
  if (ReadyForInstallation?.status === 'True') return ['known', ReadyForInstallation.message];
  if (
    ReadyForInstallation?.status === 'False' &&
    ReadyForInstallation?.reason === 'AgentIsNotApproved'
  )
    return ['pending-for-input', ReadyForInstallation.message];
  if (ReadyForInstallation?.status === 'False' && ReadyForInstallation?.reason === 'AgentNotReady')
    return ['insufficient', ReadyForInstallation.message];

  console.error('Unhandled conditions to agent status mapping: ', conditionsByType);
  return ['insufficient', 'Unexpected Agent conditions.'];
};

export type AgentStatus = Host['status'] | 'Discovered';

const getInsufficientState = (agent: AgentK8sResource) =>
  agent?.spec?.clusterDeploymentName?.name ? 'insufficient' : 'insufficient-unbound';

export const getAgentStatus = (
  agent: AgentK8sResource,
  excludeDiscovered = false,
): [AgentStatus, Host['statusInfo'], ValidationsInfo] => {
  let state: AgentStatus = agent.status?.debugInfo?.state || getInsufficientState(agent);

  const conditions = getFailingResourceConditions(agent, REQUIRED_AGENT_CONDITION_TYPES);
  let validationsInfo = agent.status?.validationsInfo;
  if (conditions?.length) {
    validationsInfo = {
      infrastructure: conditions.map(
        (c): Validation => ({
          id: c.type as HostValidationId /* Hack: the ID is used for displaying only */,
          status: 'failure',
          message: c.message,
        }),
      ),
    };
  }

  if (!excludeDiscovered && !agent.spec.approved) {
    state = 'Discovered';
  } else if (
    !['binding', 'unbinding-pending-user-action'].includes(state) &&
    validationsInfo?.infrastructure &&
    !validationsInfo.infrastructure.find((c) => c.id.toLowerCase() === 'connected')
  ) {
    state = getInsufficientState(agent);
  }

  return [state, agent.status?.debugInfo?.stateInfo || '', validationsInfo || {}];
};

export const getBMHStatus = (bmh: BareMetalHostK8sResource) => {
  const state = bmh.status?.errorType || bmh.status?.provisioning?.state;
  return {
    title: state ? state.charAt(0).toUpperCase() + state.slice(1) : state,
    message: bmh.status?.errorMessage,
  };
};
