import { IRow } from '@patternfly/react-table';
import { Netmask } from 'netmask';
import { ClusterUpdateParams } from '../api/types';

export type ClusterTableRows = IRow[];

export type HostSubnets = {
  subnet: Netmask;
  hostIDs: string[];
  humanized: string;
}[];

export type ClusterConfigurationValues = ClusterUpdateParams & {
  hostSubnet: string;
  isPullSecretEdit: boolean;
};
