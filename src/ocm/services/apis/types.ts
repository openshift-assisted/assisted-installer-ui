import { LogsType } from '../../../common/api/types';

export type ClustersAPIGetPresignedOptions = {
  clusterId: string;
  fileName: 'logs' | 'kubeconfig' | 'kubeconfig-noingress';
  hostId?: string;
  logsType?: LogsType;
};

export type EventsAPIListOptions = {
  clusterId?: string;
  hostId?: string;
  infraEnvId?: string;
  categories?: string[];
};
