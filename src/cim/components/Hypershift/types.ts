import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

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
      agent?: {
        agentLabelSelector?: {
          matchLabels?: {
            [key: string]: string;
          };
        };
      };
    };
    release: {
      image: string;
    };
  };
  status?: {
    conditions?: {
      type: string;
      status: string;
      reason: string;
      message: string;
    }[];
  };
};

export type HostedClusterK8sResource = K8sResourceCommon & {
  spec: {
    dns: {
      baseDomain: string;
    };
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

export type AgentMachineK8sResource = K8sResourceCommon & {
  status?: {
    agentRef?: {
      name: string;
      namespace: string;
    };
  };
};
