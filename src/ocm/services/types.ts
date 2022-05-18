import { ClusterCreateParams, ClusterDetailsValues, HostStaticNetworkConfig } from '../../common';

export type CreateParams = ClusterCreateParams & {
  staticNetworkConfig?: HostStaticNetworkConfig[];
};

export enum HostsNetworkConfigurationType {
  STATIC = 'static',
  DHCP = 'dhcp',
}

export type OcmClusterDetailsValues = ClusterDetailsValues & {
  cpuArchitecture: string;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
};
