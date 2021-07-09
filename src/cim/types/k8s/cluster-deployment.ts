import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

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
  };
  status?: {
    installVersion?: string;
    installedTimestamp?: string;
    installStartedTimestamp: string;
    webConsoleUrl?: string;
  };
};
