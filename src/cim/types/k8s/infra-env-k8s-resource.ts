import { K8sResourceCommon, Selector } from 'console-sdk-ai-lib';
import { StatusCondition } from './shared';

// TODO(mlibra): Add all known types
export type InfraEnvStatusConditionType = 'ImageCreated';

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
    nmStateConfigLabelSelector?: Selector;
  };
  status?: {
    agentLabelSelector?: Selector;
    conditions?: StatusCondition<InfraEnvStatusConditionType>[];
    isoDownloadURL?: string;
  };
};
