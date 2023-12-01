import { IRow } from '@patternfly/react-table';
import {
  Cluster,
  V2ClusterUpdateParams,
  ClusterValidationId,
  PlatformType,
  ImageType,
} from '@openshift-assisted/types/assisted-installer-service';
import { Validation as HostValidation } from './hosts';
export type Validation = Omit<HostValidation, 'id'> & {
  id: ClusterValidationId;
};
export type ValidationGroup =
  | 'configuration'
  | 'hostsData'
  | 'hosts-data'
  | 'network'
  | 'operators';
export type ValidationsInfo = {
  [key in ValidationGroup]?: Validation[];
};
export type ClusterWizardStepStatusDeterminationObject = {
  status: Cluster['status'];
  validationsInfo?: Cluster['validationsInfo'] | ValidationsInfo;
};
export type ClusterTableRows = IRow[];
export type HostSubnet = {
  subnet: string;
  hostIDs: string[];
  humanized: string;
  isValid: boolean;
};
export type HostSubnets = HostSubnet[];
export type NetworkConfigurationValues = Pick<
  V2ClusterUpdateParams,
  | 'clusterNetworkCidr'
  | 'clusterNetworkHostPrefix'
  | 'serviceNetworkCidr'
  | 'apiVips'
  | 'ingressVips'
  | 'sshPublicKey'
  | 'vipDhcpAllocation'
  | 'networkType'
  | 'machineNetworks'
  | 'clusterNetworks'
  | 'serviceNetworks'
> & {
  hostSubnet?: string;
  managedNetworkingType: 'userManaged' | 'clusterManaged';
  stackType?: 'singleStack' | 'dualStack';
  apiVip?: string;
  ingressVip?: string;
};
export type HostDiscoveryValues = V2ClusterUpdateParams & {
  usePlatformIntegration: boolean;
  schedulableMasters: boolean;
};
export type StorageValues = V2ClusterUpdateParams & {
  nodeLabeling: string;
};
export type OperatorsValues = V2ClusterUpdateParams & {
  useOpenShiftDataFoundation: boolean;
  useOdfLogicalVolumeManager: boolean;
  useContainerNativeVirtualization: boolean;
  useMultiClusterEngine: boolean;
};

export type SupportedPlatformType = Extract<PlatformType, 'vsphere' | 'nutanix' | 'oci'>;

export const SupportedPlatformIntegrations: SupportedPlatformType[] = ['vsphere', 'nutanix', 'oci'];
export const NonPlatformIntegrations: PlatformType[] = ['baremetal', 'none'];

export type DiscoveryImageType = ImageType | 'discovery-image-ipxe';
