import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CpuArchitecture } from '../../../common';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
  InfraEnvK8sResource,
  SecretK8sResource,
  ConfigMapK8sResource,
  NMStateK8sResource,
} from '../../types';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { BMCFormProps } from '../Agent/types';
import { AgentMachineK8sResource } from '../Hypershift/types';
import { AddHostDropdownProps, ProvisioningConfigResult } from '../InfraEnv/types';
import { AddHostModalProps, EditBMHModalProps, UploadActionModalProps } from '../modals/types';

export type EditAgentModalProps = {
  agent: AgentK8sResource | undefined;
  isOpen: boolean;
  usedHostnames: string[] | undefined;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (agent: AgentK8sResource, hostname: string) => Promise<any>;
};

export type AgentTableActions = {
  onEditHost: (agent: AgentK8sResource) => void;
  onEditRole: (agent: AgentK8sResource, role: string | undefined) => Promise<AgentK8sResource>;
  onDeleteHost: (agent?: AgentK8sResource, bmh?: BareMetalHostK8sResource) => void;
  onSetInstallationDiskId: (agent: AgentK8sResource, diskId: string) => Promise<AgentK8sResource>;
  // eslint-disable-next-line
  onMassDeleteHost: (agent?: AgentK8sResource, bmh?: BareMetalHostK8sResource) => Promise<any>;
  onApprove: (agent: AgentK8sResource) => Promise<AgentK8sResource>;
  onEditBMH: (bmh: BareMetalHostK8sResource) => void;
  onUnbindHost: (agent: AgentK8sResource) => void;
  onSelect: (agent: AgentK8sResource, selected: boolean) => void;
};

export type ClusterDeploymentWizardStepsType =
  | 'cluster-details'
  | 'hosts-selection'
  | 'hosts-discovery'
  | 'networking'
  | 'review';

export type ClusterDeploymentDetailsProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  usedClusterNames: string[];
  infraEnv?: InfraEnvK8sResource;
};

export type ClusterDeploymentDetailsValues = ClusterDetailsValues;
export type ClusterDeploymentNetworkingValues = NetworkConfigurationValues & {
  enableProxy: boolean;
  editProxy: boolean;
  httpProxy?: string;
  httpsProxy?: string;
  noProxy?: string;
};
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
  useMastersAsWorkers: boolean;
  selectedHostIds: string[];
};

export type ScaleUpFormValues = Omit<
  ClusterDeploymentHostsSelectionValues,
  'useMastersAsWorkers'
> & { cpuArchitecture: CpuArchitecture };

export type ClusterDeploymentDetailsStepProps = ClusterDeploymentDetailsProps & {
  onSaveDetails: (values: ClusterDeploymentDetailsValues) => Promise<unknown>;
  onClose: () => void;
  isPreviewOpen: boolean;
};

export type ClusterDeploymentDetailsNetworkingProps = Pick<
  AgentTableActions,
  'onEditHost' | 'onEditRole' | 'onSetInstallationDiskId'
> & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onSaveNetworking: (values: ClusterDeploymentNetworkingValues) => Promise<string | void>;
  onClose: () => void;
  fetchInfraEnv: (name: string, namespace: string) => Promise<InfraEnvK8sResource>;
  isPreviewOpen: boolean;
};

export type AgentSelectorChangeProps = {
  labels: string[];
  locations: string[];
  autoSelect: boolean;
};

export type ClusterDeploymentHostSelectionStepProps = Omit<
  ClusterDeploymentHostsSelectionProps,
  'onHostSelect' | 'onAutoSelectChange'
> & {
  onSaveHostsSelection: (values: ClusterDeploymentHostsSelectionValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentHostsDiscoveryStepProps = Omit<
  ClusterDeploymentHostsDiscoveryProps,
  'usedHostnames'
> & {
  onSaveHostsDiscovery: () => Promise<void>;
  onClose: () => void;
};

export type ClusterDeploymentWizardProps = {
  className?: string;

  onClose: () => void;
  onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
  onSaveNetworking: ClusterDeploymentDetailsNetworkingProps['onSaveNetworking'];
  onSaveHostsSelection: ClusterDeploymentHostSelectionStepProps['onSaveHostsSelection'];
  onApproveAgent: InfraEnvAgentTableProps['onApprove'];
  onFinish: () => Promise<AgentClusterInstallK8sResource>;

  hostActions: Pick<
    AgentTableActions,
    'onEditHost' | 'onEditRole' | 'onDeleteHost' | 'onSetInstallationDiskId'
  >;
  clusterImages: ClusterImageSetK8sResource[];
  usedClusterNames: string[];

  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  aiConfigMap?: ConfigMapK8sResource;
  infraEnv?: InfraEnvK8sResource;
  infraNMStates: NMStateK8sResource[];
  fetchInfraEnv: (name: string, namespace: string) => Promise<InfraEnvK8sResource>;
  initialStep?: ClusterDeploymentWizardStepsType;
  isPreviewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  fetchManagedClusters: () => Promise<K8sResourceCommon[]>;
  fetchKlusterletAddonConfig: () => Promise<K8sResourceCommon[]>;
  onSaveAgent: EditAgentModalProps['onSave'];
  onSaveBMH: EditBMHModalProps['onEdit'];
  onSaveISOParams?: AddHostModalProps['onSaveISOParams'];
  onSaveHostsDiscovery: ClusterDeploymentHostsDiscoveryStepProps['onSaveHostsDiscovery'];
  getClusterDeploymentLink: InfraEnvAgentTableProps['getClusterDeploymentLink'];
  fetchSecret: EditBMHModalProps['fetchSecret'];
  onCreateBMH?: BMCFormProps['onCreateBMH'];
  docVersion: string; // ACM version
  onCreateBmcByYaml: UploadActionModalProps['onCreateBmcByYaml'];
  provisioningConfigResult: ProvisioningConfigResult;
};

export type FetchSecret = (name: string, namespace: string) => Promise<SecretK8sResource>;

export type ClusterDeploymentHostsSelectionProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  aiConfigMap?: ConfigMapK8sResource;
  onEditRole: AgentTableActions['onEditRole'];
  onSetInstallationDiskId: AgentTableActions['onSetInstallationDiskId'];
  onAutoSelectChange: VoidFunction;
  onHostSelect: VoidFunction;
};

export type InfraEnvAgentTableProps = Pick<
  AgentTableActions,
  'onDeleteHost' | 'onApprove' | 'onEditBMH' | 'onEditHost' | 'onUnbindHost'
> & {
  agents: AgentK8sResource[];
  agentMachines: AgentMachineK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  infraEnv: InfraEnvK8sResource;
  nmStates: NMStateK8sResource[];
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string;
  onChangeHostname: (agent: AgentK8sResource, hostname: string) => Promise<AgentK8sResource>;
  onChangeBMHHostname: (
    bmh: BareMetalHostK8sResource,
    hostname: string,
  ) => Promise<BareMetalHostK8sResource>;
  // eslint-disable-next-line
  onMassDeleteHost: (agent?: AgentK8sResource, bmh?: BareMetalHostK8sResource) => Promise<any>;
  agentClusterInstalls: AgentClusterInstallK8sResource[];
};

export type ClusterDeploymentHostDiscoveryTableProps = Pick<
  AgentTableActions,
  'onEditRole' | 'onEditHost' | 'onEditBMH' | 'onDeleteHost' | 'onSetInstallationDiskId'
> & {
  agents: AgentK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  infraEnv: InfraEnvK8sResource;
  onChangeHostname: (agent: AgentK8sResource, hostname: string) => Promise<AgentK8sResource>;
  onChangeBMHHostname: (
    bmh: BareMetalHostK8sResource,
    hostname: string,
  ) => Promise<BareMetalHostK8sResource>;
  onApprove: (agents: AgentK8sResource) => Promise<AgentK8sResource>;
  width: number | undefined;
};

export type ClusterDeploymentHostsDiscoveryProps = AddHostDropdownProps & {
  clusterDeployment: ClusterDeploymentK8sResource;
  agents: AgentK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  aiConfigMap?: ConfigMapK8sResource;
  infraNMStates: NMStateK8sResource[];

  onSaveAgent: EditAgentModalProps['onSave'];
  onEditRole: ClusterDeploymentHostDiscoveryTableProps['onEditRole'];
  onSetInstallationDiskId: AgentTableActions['onSetInstallationDiskId'];
  onSaveBMH: EditBMHModalProps['onEdit'];
  fetchSecret: EditBMHModalProps['fetchSecret'];
  getClusterDeploymentLink: InfraEnvAgentTableProps['getClusterDeploymentLink'];
  onChangeBMHHostname: InfraEnvAgentTableProps['onChangeBMHHostname'];
  onApproveAgent: InfraEnvAgentTableProps['onApprove'];
  onDeleteHost: AgentTableActions['onDeleteHost'];
};
