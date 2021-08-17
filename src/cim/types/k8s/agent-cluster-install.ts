import { K8sResourceCommon } from 'console-sdk-ai-lib';
import { Cluster } from '../../../common';
import { StatusCondition } from './shared';

export type AgentClusterInstallStatusConditionType =
  | 'SpecSynced'
  | 'Validated'
  | 'RequirementsMet'
  | 'Completed'
  | 'Failed'
  | 'Stopped';

export type AgentClusterInstallStatusCondition = StatusCondition<
  AgentClusterInstallStatusConditionType
>;

export type AgentClusterInstallK8sResource = K8sResourceCommon & {
  spec?: {
    clusterDeploymentRef: {
      name: string;
    };
    clusterMetadata?: {
      adminKubeconfigSecretRef?: {
        name: string;
      };
      adminPasswordSecretRef?: {
        name: string;
      };
    };
    apiVIP?: string;
    ingressVIP?: string;
    sshPublicKey?: string;
    imageSetRef?: {
      name?: string;
    };
    provisionRequirements: {
      controlPlaneAgents: number;
    };
    networking: {
      clusterNetwork?: {
        cidr: string;
        hostPrefix: number;
      }[];
      serviceNetwork?: string[];
      machineNetwork?: {
        cidr: string;
      }[];
    };
  };
  status?: {
    connectivityMajorityGroups?: string;
    conditions?: AgentClusterInstallStatusCondition[];
    debugInfo?: {
      eventsURL: string;
      logsURL: string;
      state: Cluster['status'];
      stateInfo: Cluster['statusInfo'];
    };
  };
};
