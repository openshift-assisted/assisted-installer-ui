import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';
import { AgentK8sResource } from '../../types/k8s/agent';
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
import { agentStatus } from './agentStatus';
import { TFunction } from 'i18next';
import { HostStatus } from '../../../common/components/hosts/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const conditionsByTypeReducer = <K>(
  result: { K?: StatusCondition<string> },
  condition: StatusCondition<string>,
) => ({
  ...result,
  [condition.type]: condition,
});

export const getClusterStatus = (
  agentClusterInstall?: AgentClusterInstallK8sResource,
): [Cluster['status'], Cluster['statusInfo']] => {
  const { state: status, stateInfo: statusInfo } = agentClusterInstall?.status?.debugInfo || {};
  return [status || 'insufficient', statusInfo || ''];
};

export const isDraft = (agentClusterInstall?: AgentClusterInstallK8sResource): boolean =>
  !!agentClusterInstall &&
  ['pending-for-input', 'insufficient', 'ready'].includes(getClusterStatus(agentClusterInstall)[0]);

export type AgentStatus = Host['status'] | 'discovered';

const getInsufficientState = (agent: AgentK8sResource) =>
  agent?.spec?.clusterDeploymentName?.name ? 'insufficient' : 'insufficient-unbound';

export const getAgentStatusKey = (agent: AgentK8sResource, excludeDiscovered = false) => {
  const specSyncErr = agent.status?.conditions?.find(
    (c) => c.type === 'SpecSynced' && c.status === 'False',
  );
  if (specSyncErr) {
    return 'specSyncErr';
  } else {
    if (!excludeDiscovered && !agent.spec.approved) {
      return 'discovered';
    } else {
      return agent.status?.debugInfo?.state || getInsufficientState(agent);
    }
  }
};

export const getAgentStatus = (
  agent: AgentK8sResource,
  agentStatuses: HostStatus<string>,
  excludeDiscovered = false,
): { status: HostStatusDef; validationsInfo: ValidationsInfo; autoCSR?: boolean } => {
  const key = getAgentStatusKey(agent, excludeDiscovered);

  let validationsInfo: ValidationsInfo = {};

  const status = agentStatuses[key];
  if (key !== 'specSyncErr') {
    validationsInfo = agent.status?.validationsInfo || {};
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
  const agentStatuses = agentStatus(t);
  const aStatus = getAgentStatus(agent, agentStatuses, excludeDiscovered);

  if ([agentStatuses.discovered, agentStatuses.specSyncErr].includes(aStatus.status)) {
    return aStatus;
  }

  const status =
    agentStatuses[
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

export const getBMHStatusKey = (bmh: BareMetalHostK8sResource) => {
  if (bmh.status?.errorType) {
    return 'bmh-error';
  } else if (bmh.status?.provisioning?.state) {
    return bmh.status?.provisioning?.state;
  }
};

export const getBMHStatus = (bmh: BareMetalHostK8sResource, bmhStatuses: HostStatus<string>) => {
  let bmhState = bmhStatuses.pending;
  const statusKey = getBMHStatusKey(bmh);
  if (statusKey) {
    bmhState = bmhStatuses[statusKey] || bmhState;
  }

  return {
    state: bmhState,
    errorMessage: bmh.status?.errorMessage,
  };
};
