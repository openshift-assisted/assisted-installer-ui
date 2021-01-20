import { IRow } from '@patternfly/react-table';
import { ClusterUpdateParams } from '../api/types';
import { Validation } from './hosts';

export type ClusterTableRows = IRow[];

export type HostSubnet = {
  subnet: string;
  hostIDs: string[];
  humanized: string;
};

export type HostSubnets = HostSubnet[];

export type NetworkConfigurationValues = ClusterUpdateParams & {
  hostSubnet?: string;
  useRedHatDnsService?: boolean;
  shareDiscoverySshKey?: boolean;
};

export type BareMetalDiscoveryValues = ClusterUpdateParams & {
  useExtraDisksForLocalStorage: boolean;
};

export type ClusterDetailsValues = ClusterUpdateParams & {
  useRedHatDnsService: boolean;
};

export type ValidationsInfo = {
  hostsData: Validation[];
  network: Validation[];
  configuration: Validation[];
};
