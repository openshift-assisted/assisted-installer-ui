import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
} from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';

export type ClusterDeploymentHostsTablePropsActions = {
  canEditHost?: (agent: AgentK8sResource) => boolean;
  onEditHost?: (agent: AgentK8sResource) => void;
  canEditRole?: (agent: AgentK8sResource) => boolean;
  onEditRole?: (agent: AgentK8sResource, role: string | undefined) => Promise<void>;
  canDelete?: (agent: AgentK8sResource) => boolean;
  onDeleteHost?: (agent: AgentK8sResource) => void;
<<<<<<< HEAD
  onApprove?: (agent: AgentK8sResource) => void;
  onHostSelected?: (agent: AgentK8sResource, selected: boolean) => void;
=======
>>>>>>> 9fe0054 (Persist selection of agents)

  // onHostSelected?: (agent: AgentK8sResource, selected: boolean) => void;
  // selectedHostIds?: string[]; // not needed when onHostSelected === undefined in HostTable
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
export type AgentLocation = {
  value: string;
  itemCount: number;
};

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
  autoSelectHosts: boolean;
  hostCount: number;
  useMastersAsWorkers: boolean;
  agentLabels: string[];
  locations: string[];
  selectedHostIds: string[];

  isSNOCluster: boolean; // read-only, never changed
};

export type ClusterDeploymentDetailsStepProps = ClusterDeploymentDetailsProps & {
  onSaveDetails: (values: ClusterDeploymentDetailsValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentDetailsNetworkingProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  pullSecretSet: boolean;
  onSaveNetworking: (values: ClusterDeploymentNetworkingValues) => Promise<string | void>;
  onClose: () => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

export type AgentSelectorChageProps = {
  labels?: string[];
  locations?: string[];
};

export type ClusterDeploymentHostsSelectionProps = {
  // All unique labels used in the Agents. Used for auto-suggestion.
  usedAgentLabels?: string[];

  // calculated from AGENT_LOCATION_LABEL_KEY label
  agentLocations?: AgentLocation[];

  // on-the-fly result of a qeury based on value just entered & passed through onAgentSelectorChange()
  matchingAgents?: AgentK8sResource[];

  // Count of all Agent resources in the k8s database (no label applied). For user's info only.
  // allAgentsCount?: number;

  // Callback trigerred when the user changes labels in the UI. It is expected that "matchingAgents" list is updated based on the new value.
  onAgentSelectorChange: (props: AgentSelectorChageProps) => void;

  // wrapping objects with HostTable callbacks
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

export type ClusterDeploymentHostSelectionStepProps = ClusterDeploymentHostsSelectionProps & {
  clusterDeployment: ClusterDeploymentK8sResource;
  selectedHostIds: string[];
  agentClusterInstall: AgentClusterInstallK8sResource;
  // agents: AgentK8sResource[];
  onSaveHostsSelection: (values: ClusterDeploymentHostsSelectionValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps &
  ClusterDeploymentHostSelectionStepProps & {
    className?: string;

    onClose: () => void;
    onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
    onSaveNetworking: ClusterDeploymentDetailsNetworkingProps['onSaveNetworking'];
    onSaveHostsSelection: ClusterDeploymentHostSelectionStepProps['onSaveHostsSelection'];
  };
