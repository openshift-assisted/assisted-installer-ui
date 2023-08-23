import { ClusterDetailsValues } from '../../common';
import {
  ClusterCreateParams,
  HostStaticNetworkConfig,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';

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
  isCMNSupported: boolean;
};
