import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type ClusterInstallRef = {
  group: string;
  kind: string;
  version: string;
  name: string;
};

export type ClusterDeploymentK8sResource = K8sResourceCommon & {
  spec?: {
    baseDomain: string;
    clusterInstallRef: ClusterInstallRef;
    clusterName: string;
    platform: {
      agentBareMetal: {
        agentSelector?: unknown;
        // agentSelector: Selector;
      };
    };
    pullSecretRef?: {
      name: string;
    };
  };
  status?: {
    installVersion?: string;
    installedTimestamp?: string;
    installStartedTimestamp: string;
    webConsoleUrl?: string;
  };
};
