import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Selector } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
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
    additionalNTPSources?: string[];
    cpuArchitecture?: 'x86_64' | 'arm64';
  };
  status?: {
    agentLabelSelector?: Selector;
    conditions?: StatusCondition<InfraEnvStatusConditionType>[];
    isoDownloadURL?: string;
    createdTime?: string;
    debugInfo?: {
      eventsURL?: string;
    };
  };
};
