import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
  InfraEnvK8sResource,
  SecretK8sResource,
  ConfigMapK8sResource,
} from '../../types';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { InfraEnvAgentTableProps } from '../InfraEnv/InfraEnvAgentTable';
import { EditAgentModalProps } from '../modals/EditAgentModal';
import { EditBMHModalProps } from '../modals/EditBMHModal';
import { AddHostModalProps } from '../modals/types';

export type ClusterDeploymentHostsTablePropsActions = {
  canEditHost?: (agent: AgentK8sResource) => boolean;
  onEditHost?: (agent: AgentK8sResource) => void;
  canEditRole?: (agent: AgentK8sResource) => boolean;
  onEditRole?: (agent: AgentK8sResource, role: string | undefined) => Promise<AgentK8sResource>;
  canDelete?: (agent?: AgentK8sResource, bmh?: BareMetalHostK8sResource) => boolean;
  onDeleteHost?: (agent?: AgentK8sResource, bmh?: BareMetalHostK8sResource) => void;
  onApprove?: (agent: AgentK8sResource) => void;
  onSelect?: (agent: AgentK8sResource, selected: boolean) => void;
  onEditBMH?: (bmh: BareMetalHostK8sResource) => void;
};

export type ClusterDeploymentWizardStepsType = 'cluster-details' | 'hosts-selection' | 'networking';

export type ClusterDeploymentDetailsProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  usedClusterNames: string[];
  pullSecret?: string;
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
  autoSelectedHostIds: string[];
};
export type ClusterDeploymentHostsDiscoveryValues = {
  /* TODO(mlibra): CNV, OCS */
};

export type ScaleUpFormValues = Omit<ClusterDeploymentHostsSelectionValues, 'useMastersAsWorkers'>;

export type ClusterDeploymentDetailsStepProps = ClusterDeploymentDetailsProps & {
  onSaveDetails: (values: ClusterDeploymentDetailsValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentDetailsNetworkingProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onSaveNetworking: (values: ClusterDeploymentNetworkingValues) => Promise<string | void>;
  onClose: () => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
  onFinish: VoidFunction;
};

export type AgentSelectorChangeProps = {
  labels: string[];
  locations: string[];
  autoSelect: boolean;
};

export type ClusterDeploymentHostSelectionStepProps = Omit<
  ClusterDeploymentHostsSelectionProps,
  'onValuesChanged'
> & {
  onSaveHostsSelection: (values: ClusterDeploymentHostsSelectionValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentHostsDiscoveryStepProps = Omit<
  ClusterDeploymentHostsDiscoveryProps,
  'onValuesChanged'
> & {
  onSaveHostsDiscovery?: (values: ClusterDeploymentHostsDiscoveryValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentWizardProps = Pick<
  ClusterDeploymentHostsDiscoveryStepProps,
  | 'onSaveHostsDiscovery'
  | 'onApproveAgent'
  | 'onDeleteHost'
  | 'canDeleteAgent'
  | 'onSaveAgent'
  | 'onSaveBMH'
  | 'getClusterDeploymentLink'
  | 'fetchSecret'
  | 'fetchNMState'
  | 'isBMPlatform'
> & {
  className?: string;

  onClose: () => void;
  onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
  onSaveNetworking: ClusterDeploymentDetailsNetworkingProps['onSaveNetworking'];
  onSaveHostsSelection: ClusterDeploymentHostSelectionStepProps['onSaveHostsSelection'];
  onFinish: VoidFunction;

  hostActions: ClusterDeploymentHostsTablePropsActions;
  clusterImages: ClusterImageSetK8sResource[];
  usedClusterNames: string[];

  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  aiConfigMap?: ConfigMapK8sResource;
  infraEnv?: InfraEnvK8sResource;
};

export type FetchSecret = (name: string, namespace: string) => Promise<SecretK8sResource>;

export type ClusterDeploymentHostsSelectionProps = {
  onValuesChanged?: (values: ClusterDeploymentHostsSelectionValues) => void;
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  aiConfigMap?: ConfigMapK8sResource;
};

export type ClusterDeploymentHostsDiscoveryProps = {
  // clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  aiConfigMap?: ConfigMapK8sResource;
  infraEnv: InfraEnvK8sResource;

  usedHostnames: EditAgentModalProps['usedHostnames'];
  onValuesChanged?: (values: ClusterDeploymentHostsDiscoveryValues) => void;
  onCreateBMH?: AddHostModalProps['onCreate'];
  onApproveAgent: InfraEnvAgentTableProps['onApprove'];
  onDeleteHost: InfraEnvAgentTableProps['onDeleteHost'];
  canDeleteAgent: InfraEnvAgentTableProps['canDelete'];
  onSaveAgent: EditAgentModalProps['onSave'];
  onSaveBMH: EditBMHModalProps['onEdit'];
  onFormSaveError?: EditAgentModalProps['onFormSaveError'];
  fetchSecret: EditBMHModalProps['fetchSecret'];
  fetchNMState: EditBMHModalProps['fetchNMState'];
  isBMPlatform: AddHostModalProps['isBMPlatform'];
  getClusterDeploymentLink: InfraEnvAgentTableProps['getClusterDeploymentLink'];
};
