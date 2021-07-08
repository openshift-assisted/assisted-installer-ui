import { K8sResourceCommon, Selector } from '@openshift-console/dynamic-plugin-sdk';

export type InfraEnv = K8sResourceCommon & {
  spec?: {
    agentLabels?: string[];
    clusterRef?: {
      name: string;
      namespace: string;
    };
    pullSecretRef?: {
      name: string;
    };
    sshAuthorizedKey?: string;
    proxy?: {
      httpProxy: string;
      httpsProxy: string;
      noProxy: string;
    };
  };
  status?: {
    agentLabelSelector?: Selector;
    conditions?: unknown[];
    isoDownloadURL?: string;
  };
};
