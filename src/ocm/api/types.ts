import { ClusterDetailsValues } from '../../common/components/clusterWizard/types';
import { Error as APIError, InfraError } from '../../common/api/types';

export type APIErrorMixin = InfraError & APIError;

export type OcmClusterDetailsValues = ClusterDetailsValues & {
  cpuArchitecture: string;
};
