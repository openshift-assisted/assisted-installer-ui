import { LogsType } from '../../../common/api/types';

export type GetPresignedForClusterCredentialsOptions = {
  clusterId: string;
  fileName: 'logs' | 'kubeconfig' | 'kubeconfig-noingress';
  hostId?: string;
  logsType?: LogsType;
};

export type EventAPIListOptions = {
  clusterId?: string;
  hostId?: string;
  infraEnvId?: string;
  categories?: string[];
};
