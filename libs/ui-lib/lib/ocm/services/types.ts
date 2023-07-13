import {
  ClusterCreateParams,
  ClusterDetailsValues,
  HostStaticNetworkConfig,
  V2ClusterUpdateParams,
} from '../../common';

export type ClusterDetailsUpdateParams = Pick<
  V2ClusterUpdateParams,
  'name' | 'baseDnsDomain' | 'pullSecret' | 'platform'
>;

export type ClusterCreateParamsWithStaticNetworking = ClusterCreateParams & {
  staticNetworkConfig?: HostStaticNetworkConfig[];
};

export enum HostsNetworkConfigurationType {
  STATIC = 'static',
  DHCP = 'dhcp',
}

export type OcmClusterDetailsValues = ClusterDetailsValues & {
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
  addCustomManifest: boolean;
};
