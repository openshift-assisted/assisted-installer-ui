import { K8sResourceCommon } from 'console-sdk-ai-lib';
import { StatusCondition } from './shared';

type VolumeAccessMode = 'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany' | 'ReadWriteOncePod';
type StorageConfig = {
  accessModes: VolumeAccessMode[];
  resources: {
    requests: {
      storage: string; // i.e. 10G, 200M
    };
  };
};

export type AgentServiceConfigConditionType = 'DeploymentsHealthy' | 'ReconcileCompleted';

export type AgentServiceConfigK8sResource = K8sResourceCommon & {
  // agentserviceconfigs.agent-install.openshift.io
  // "group": "agent-install.openshift.io",
  // "names": {
  //     "kind": "AgentServiceConfig",
  //     "listKind": "AgentServiceConfigList",
  //     "plural": "agentserviceconfigs",
  //     "singular": "agentserviceconfig"
  // },
  // "scope": "Cluster",
  // version: "v1beta1",

  spec: {
    databaseStorage: StorageConfig;
    filesystemStorage: StorageConfig;
    imageStorage: StorageConfig;
  };
  status?: {
    conditions?: StatusCondition<AgentServiceConfigConditionType>[];
  };
};
