import { K8sResourceCommon } from 'console-sdk-ai-lib';
import { Host, HostRole, HostStage, Inventory } from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import { StatusCondition } from './shared';

export type AgentStatusConditionType =
  | 'SpecSynced'
  | 'Validated'
  | 'Connected'
  | 'ReadyForInstallation'
  | 'Installed';

export type AgentStatusCondition = StatusCondition<AgentStatusConditionType>;

export type AgentK8sResource = K8sResourceCommon & {
  spec: {
    approved: boolean;
    clusterDeploymentName?: {
      name: string;
      namespace: string;
    };
    role: HostRole;
    hostname: string;
  };
  status?: {
    conditions?: AgentStatusCondition[];
    validationsInfo: ValidationsInfo;
    inventory: Inventory;
    progress: {
      currentStage: HostStage;
      installationPercentage: number;
      progressInfo: string;
      progressStages: HostStage[];
      stageStartTime: string;
      stageUpdateTime: string;
    };
    debugInfo: {
      eventsUrl: string;
      state: Host['status'];
      stateInfo: Host['statusInfo'];
    };
    role?: Host['role'];
    bootstrap?: Host['bootstrap'];
  };
};
