import { K8sResourceCommon, Selector } from 'console-sdk-ai-lib';

export type InfraEnvK8sResource = K8sResourceCommon & {
  spec?: {
    agentLabels?: { [key: string]: string };
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
