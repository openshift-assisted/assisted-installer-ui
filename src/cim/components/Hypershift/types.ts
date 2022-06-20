import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type NodePoolK8sResource = K8sResourceCommon & {
  spec: {
    clusterName: string;
    replicas: number;
    management: {
      autoRepair: boolean;
      upgradeType: string;
    };
    platform: {
      type: string;
      agent: {
        agentLabelSelector: {
          matchLabels: object;
        };
      };
    };
    release: {
      image: string;
    };
  };
};

export type HostedClusterK8sResource = K8sResourceCommon & {
  spec: {
    platform: {
      agent?: {
        agentNamespace: string;
      };
    };
  };
  status?: {
    conditions?: {
      type: string;
      status: string;
      reason: string;
      message: string;
    }[];
    kubeconfig?: {
      name: string;
    };
  };
};
