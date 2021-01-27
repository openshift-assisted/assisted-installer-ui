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

// TODO(mlibra): just name?
export type BareMetalDiscoveryValues = ClusterUpdateParams;

export type ValidationsInfo = {
  hostsData: Validation[];
  network: Validation[];
  configuration: Validation[];
};
