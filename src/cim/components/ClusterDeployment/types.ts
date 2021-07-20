import { Cluster, OpenshiftVersionOptionType } from '../../../common';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
  ClusterCIMExtended,
} from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';

export type ClusterDeploymentHostsTablePropsActions = {
  canEditHost?: (agent: AgentK8sResource) => boolean;
  onEditHost?: (agent: AgentK8sResource) => void;
  canEditRole?: (agent: AgentK8sResource) => boolean;
  onEditRole?: (agent: AgentK8sResource, role: string | undefined) => Promise<void>;
  canDelete?: (agent: AgentK8sResource) => boolean;
  onDeleteHost?: (agent: AgentK8sResource) => void;
  onApprove?: (agent: AgentK8sResource) => void;
};

/*
export type ClusterDeploymentHostsTablePropsActions = Pick<
  HostsTableProps,
  | 'onEditHost'
  | 'canEditHost'
  | 'onEditRole'
  | 'canEditRole'
  | 'onDeleteHost'
  | 'canDelete'
  | 'AdditionalNTPSourcesDialogToggleComponent'

  /* TODO(mlibra): List other actions
      onHostEnable: async (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      onInstallHost: async (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      onHostDisable: async (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      onViewHostEvents 
      onHostReset
      onDownloadHostLogs

      canEditRole: (host: Host) => canEditRoleUtil(cluster, host.status),
      canInstallHost: (host: Host) => canInstallHostUtil(cluster, host.status),
      canEditDisks: (host: Host) => canEditDisksUtil(cluster.status, host.status),
      canEnable: (host: Host) => canEnableUtil(cluster.status, host.status),
      canDisable: (host: Host) => canDisableUtil(cluster.status, host.status),
      canEditHost: (host: Host) => canEditHostUtil(cluster.status, host.status),
      canReset: (host: Host) => canResetUtil(cluster.status, host.status),
  
>;
*/

export type ClusterDeploymentWizardStepsType = 'cluster-details' | 'hosts-selection' | 'networking';

export type ClusterDeploymentDetailsProps = {
  defaultPullSecret: string;

  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  pullSecretSet: boolean;

  usedClusterNames: string[];
};

export type ClusterDeploymentDetailsValues = ClusterDetailsValues;
export type ClusterDeploymentNetworkingValues = NetworkConfigurationValues;
export type ClusterDeploymentHostsSelectionValues = {
  hostCount: number;
  useMastersAsWorkers: boolean;
  labels: string[];
  autoSelectMasters: boolean;
};

export type ClusterDeploymentDetailsStepProps = ClusterDeploymentDetailsProps & {
  onSaveDetails: (values: ClusterDeploymentDetailsValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentDetailsNetworkingProps = ClusterDeploymentHostsTablePropsActions & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  pullSecretSet: boolean;
  onSaveNetworking: (values: ClusterDeploymentNetworkingValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentHostsSelectionProps = {};

export type ClusterDeploymentHostSelectionStepProps = ClusterDeploymentHostsSelectionProps & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onSaveHostsSelection: (values: ClusterDeploymentHostsSelectionValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps &
  ClusterDeploymentHostsTablePropsActions & {
    className?: string;

    onClose: () => void;
    onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
    onSaveNetworking: ClusterDeploymentDetailsNetworkingProps['onSaveNetworking'];
    onSaveHostsSelection: ClusterDeploymentHostSelectionStepProps['onSaveHostsSelection'];
  };
