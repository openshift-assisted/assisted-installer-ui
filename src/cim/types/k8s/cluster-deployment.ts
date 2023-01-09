import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Selector } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { StatusCondition } from './shared';

export type ClusterDeploymentStatusConditionType =
  | 'ClusterInstallCompleted'
  | 'ClusterInstallFailed'
  | 'ClusterInstallStopped'
  | 'ProvisionFailed'
  | 'ProvisionStopped'
  | 'RequirementsMet'
  | 'AuthenticationFailure'
  | 'ClusterInstallRequirementsMet'
  | 'InstallImagesNotResolved'
  | 'InstallerImageResolutionFailed'
  | 'RelocationFailed'
  | 'AWSPrivateLinkFailed'
  | 'AWSPrivateLinkReady'
  | 'ActiveAPIURLOverride'
  | 'ControlPlaneCertificateNotFound'
  | 'DNSNotReady'
  | 'DeprovisionLaunchError'
  | 'Hibernating'
  | 'IngressCertificateNotFound'
  | 'InstallLaunchError'
  | 'SyncSetFailed'
  | 'Unreachable';

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
        agentSelector?: Selector;
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
    webConsoleURL?: string;
    apiURL?: string;
    conditions?: StatusCondition<ClusterDeploymentStatusConditionType>[];
  };
};
