import { IRow } from '@patternfly/react-table';
import { Cluster, V2ClusterUpdateParams, ClusterValidationId, PlatformType } from '../api/types';
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
};
export type HostSubnets = HostSubnet[];
export type NetworkConfigurationValues = Pick<
  V2ClusterUpdateParams,
  | 'clusterNetworkCidr'
  | 'clusterNetworkHostPrefix'
  | 'serviceNetworkCidr'
  | 'apiVip'
  | 'ingressVip'
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
};
export enum CpuArchitecture {
  x86 = 'x86_64',
  ARM = 'arm64',
}
export type SupportedPlatformType = Extract<PlatformType, 'vsphere' | 'nutanix'>;

export const SupportedPlatformIntegrations: SupportedPlatformType[] = ['vsphere', 'nutanix'];

export const NonPlatformIntegrations: PlatformType[] = ['baremetal', 'none'];
