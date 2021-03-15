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

export type ClusterConfigurationValues = ClusterUpdateParams & {
  hostSubnet: string;
  useRedHatDnsService: boolean;
  shareDiscoverySshKey: boolean;
  useExtraDisksForLocalStorage: boolean;
};

export type ValidationsInfo = {
  hostsData: Validation[];
  network: Validation[];
  configuration: Validation[];
  operators: Validation[];
};
