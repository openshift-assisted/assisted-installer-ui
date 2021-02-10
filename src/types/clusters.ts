import { IRow } from '@patternfly/react-table';
import { ClusterUpdateParams, ClusterValidationId } from '../api/types';
import { Validation as HostValidation } from './hosts';

export type Validation = HostValidation & {
  id: ClusterValidationId;
};

export type ValidationGroup = 'configuration' | 'hostsData' | 'network' | 'operators';

export type ValidationsInfo = {
  [key in ValidationGroup]?: Validation[];
};

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
  useExtraDisksForLocalStorage: boolean;
};

export type ClusterDetailsValues = ClusterUpdateParams & {
  useRedHatDnsService: boolean;
};

export type BareMetalDiscoveryValues = ClusterUpdateParams;
