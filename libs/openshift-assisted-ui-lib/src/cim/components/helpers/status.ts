import {
  AgentClusterInstallK8sResource,
  AgentClusterInstallStatusCondition,
  AgentClusterInstallStatusConditionType,
} from '../../types/k8s/agent-cluster-install';
import { Cluster, Host } from '../../../common/api/types';
import {
  AgentK8sResource,
  AgentStatusCondition,
  AgentStatusConditionType,
} from '../../types/k8s/agent';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import { StatusCondition } from '../../types/k8s/shared';
import { ValidationsInfo } from '../../../common/types/hosts';
import {
  areOnlySoftValidationsOfWizardStepFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../../../common/components/clusterWizard/validationsInfoUtils';
import {
  ClusterWizardStepsType,
  wizardStepsValidationsMap,
} from '../ClusterDeployment/wizardTransition';
import { HostStatusDef } from '../../../common';
import { agentStatus, bmhStatus } from './agentStatus';
import { TFunction } from 'i18next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const conditionsByTypeReducer = <K>(
  result: { K?: StatusCondition<string> },
  condition: StatusCondition<string>,
) => ({
  ...result,
  [condition.type]: condition,
});

export const getClusterStatusFromConditions = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  t: TFunction,
): [Cluster['status'], string] => {
  const conditions = agentClusterInstall?.status?.conditions || [];

  const conditionsByType: {
    [key in AgentClusterInstallStatusConditionType]?: AgentClusterInstallStatusCondition;
  } = conditions.reduce(conditionsByTypeReducer, {});

  const { Validated, RequirementsMet, Completed, Stopped } = conditionsByType;

  if (!Validated || !RequirementsMet || !Completed || !Stopped) {
    return ['insufficient', t('ai:AgentClusterInstall conditions are missing.')];
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
  return ['insufficient', t('ai:Unexpected AgentClusterInstall conditions.')];
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

export const getAgentStatusFromConditions = (
  agent: AgentK8sResource,
  t: TFunction,
): [Host['status'], string] => {
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
  return ['insufficient', t('ai:Unexpected Agent conditions.')];
};

export type AgentStatus = Host['status'] | 'discovered';

const getInsufficientState = (agent: AgentK8sResource) =>
  agent?.spec?.clusterDeploymentName?.name ? 'insufficient' : 'insufficient-unbound';

export const getAgentStatus = (
  agent: AgentK8sResource,
  excludeDiscovered = false,
): { status: HostStatusDef; validationsInfo: ValidationsInfo; autoCSR?: boolean } => {
  let status: HostStatusDef =
    agentStatus[agent.status?.debugInfo?.state || getInsufficientState(agent)];
  const validationsInfo = agent.status?.validationsInfo || {};
  if (!excludeDiscovered && !agent.spec.approved) {
    status = agentStatus.discovered;
  }
  // TODO(jtomasek): Implement this
  // const sublabel = areOnlyClusterSoftValidationsFailing(agentStatus.validationsInfo)
  //   ? 'Some validations failed'
  //   : undefined;
  return { status, validationsInfo };
};

export const getWizardStepAgentStatus = (
  agent: AgentK8sResource,
  wizardStepId: ClusterWizardStepsType,
  t: TFunction,
  excludeDiscovered = false,
): { status: HostStatusDef; validationsInfo: ValidationsInfo } => {
  const aStatus = getAgentStatus(agent, excludeDiscovered);
  if (aStatus.status === agentStatus.discovered) {
    return aStatus;
  }

  const status =
    agentStatus[
      getWizardStepHostStatus(wizardStepId, wizardStepsValidationsMap, {
        status: aStatus.status.key as Host['status'],
        validationsInfo: aStatus.validationsInfo,
      })
    ];
  const validationsInfo = getWizardStepHostValidationsInfo(
    aStatus.validationsInfo,
    wizardStepId,
    wizardStepsValidationsMap,
  );
  status.sublabel = areOnlySoftValidationsOfWizardStepFailing(
    aStatus.validationsInfo,
    wizardStepId,
    wizardStepsValidationsMap,
  )
    ? t('ai:Some validations failed')
    : undefined;

  return {
    status,
    validationsInfo,
  };
};

export const getBMHStatus = (bmh: BareMetalHostK8sResource) => {
  let bmhState = bmhStatus.pending;

  if (bmh.status?.errorType) {
    bmhState = bmhStatus['bmh-error'];
  } else if (bmh.status?.provisioning?.state) {
    bmhState = bmhStatus[bmh.status?.provisioning?.state] || bmhStatus.pending;
  }

  return {
    state: bmhState,
    errorMessage: bmh.status?.errorMessage,
  };
};
