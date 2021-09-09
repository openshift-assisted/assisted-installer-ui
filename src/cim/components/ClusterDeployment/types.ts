import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
  SecretK8sResource,
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
  onSelect?: (agent: AgentK8sResource, selected: boolean) => void;
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
};

export type AgentSelectorChangeProps = {
  labels: string[];
  locations: string[];
  autoSelect: boolean;
};

export type ClusterDeploymentHostSelectionStepProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onSaveHostsSelection: (values: ClusterDeploymentHostsSelectionValues) => Promise<string | void>;
  onClose: () => void;
  hostActions: ClusterDeploymentHostsTablePropsActions;
};

export type ClusterDeploymentWizardProps = {
  className?: string;
  onClose: () => void;
  onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
  onSaveNetworking: ClusterDeploymentDetailsNetworkingProps['onSaveNetworking'];
  onSaveHostsSelection: ClusterDeploymentHostSelectionStepProps['onSaveHostsSelection'];
  hostActions: ClusterDeploymentHostsTablePropsActions;
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  clusterImages: ClusterImageSetK8sResource[];
  usedClusterNames: string[];
};

export type FetchSecret = (name: string, namespace: string) => Promise<SecretK8sResource>;

export type ClusterDeploymentHostsSelectionProps = {
  agentClusterInstall: AgentClusterInstallK8sResource;
  availableAgents: AgentK8sResource[];
  hostActions: ClusterDeploymentHostsTablePropsActions;
};
