import { ClusterCreateParams, ClusterDetailsValues, HostStaticNetworkConfig } from '../../common';

export type ClusterCreateParamsWithStaticNetworking = ClusterCreateParams & {
  staticNetworkConfig?: HostStaticNetworkConfig[];
};

export enum HostsNetworkConfigurationType {
  STATIC = 'static',
  DHCP = 'dhcp',
}

export type OcmClusterDetailsValues = ClusterDetailsValues & {
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
};
