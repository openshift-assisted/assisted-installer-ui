import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Cluster } from '../../../common';
import { ValidationsInfo } from '../../../common/types/clusters';
import { StatusCondition } from './shared';

export type AgentClusterInstallStatusConditionType =
  | 'SpecSynced'
  | 'Validated'
  | 'RequirementsMet'
  | 'Completed'
  | 'Failed'
  | 'Stopped';

export type AgentClusterInstallStatusCondition =
  StatusCondition<AgentClusterInstallStatusConditionType>;

export type AgentClusterInstallK8sResource = K8sResourceCommon & {
  spec?: {
    clusterDeploymentRef?:
      | {
          name: string;
          namespace: string;
        }
      // eslint-disable-next-line @typescript-eslint/ban-types
      | {};
    clusterMetadata?: {
      adminKubeconfigSecretRef?: {
        name: string;
      };
      adminPasswordSecretRef?: {
        name: string;
      };
      clusterID?: string;
    };
    apiVIP?: string;
    ingressVIP?: string;
    sshPublicKey?: string;
    imageSetRef?: {
      name?: string;
    };
    proxy?: {
      httpProxy?: string;
      httpsProxy?: string;
      noProxy?: string;
    };
    provisionRequirements: {
      controlPlaneAgents: number;
      workerAgents?: number;
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
    holdInstallation?: boolean;
  };
  status?: {
    apiVIP?: string;
    ingressVIP?: string;
    connectivityMajorityGroups?: string;
    conditions?: AgentClusterInstallStatusCondition[];
    progress?: {
      totalPercentage: number;
    };
    debugInfo?: {
      eventsURL?: string;
      logsURL?: string;
      state?: Cluster['status'];
      stateInfo?: Cluster['statusInfo'];
    };
    validationsInfo?: ValidationsInfo;
    machineNetwork?: {
      cidr: string;
    }[];
  };
};
