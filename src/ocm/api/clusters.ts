import { AxiosPromise, AxiosRequestConfig } from 'axios';
import {
  Cluster,
  ClusterCreateParams,
  Host,
  ClusterUpdateParams,
  ImageCreateParams,
  Credentials,
  Presigned,
  EventList,
  Event,
  LogsType,
  ClusterDefaultConfig,
  PreflightHardwareRequirements,
  PlatformType,
} from '../../common/api/types';
import { client, BASE_PATH } from './axiosClient';

export const getClusters = (): AxiosPromise<Cluster[]> => client.get('/v1/clusters');
export const getClustersDefaultConfiguration = (): AxiosPromise<ClusterDefaultConfig> =>
  client.get('/v2/clusters/default-config');

export const getCluster = (id: string): AxiosPromise<Cluster> => client.get(`/v1/clusters/${id}`);
export const getClustersByOpenshiftId = (openshiftId: string): AxiosPromise<Cluster[]> =>
  client.get(`/v1/clusters?openshift_cluster_id=${openshiftId}`);

export const postCluster = (params: ClusterCreateParams): AxiosPromise<Cluster> =>
  client.post('/v1/clusters', params);

export const patchCluster = (id: string, params: ClusterUpdateParams): AxiosPromise<Cluster> =>
  client.patch(`/v1/clusters/${id}`, params);

export const deleteCluster = (id: string): AxiosPromise<void> =>
  client.delete(`/v1/clusters/${id}`);

export const getClusterHosts = (id: string): AxiosPromise<Host[]> =>
  client.get(`/v1/clusters/${id}/hosts`);

export const enableClusterHost = (clusterId: string, hostId: string): AxiosPromise<Cluster> =>
  client.post(`/v1/clusters/${clusterId}/hosts/${hostId}/actions/enable`);

export const disableClusterHost = (clusterId: string, hostId: string): AxiosPromise<Cluster> =>
  client.delete(`/v1/clusters/${clusterId}/hosts/${hostId}/actions/enable`);

export const resetClusterHost = (clusterId: string, hostId: string): AxiosPromise<Host> =>
  client.post(`/v1/clusters/${clusterId}/hosts/${hostId}/actions/reset`);

export const deleteClusterHost = (clusterId: string, hostId: string): AxiosPromise<void> =>
  client.delete(`/v1/clusters/${clusterId}/hosts/${hostId}`);

export const postInstallCluster = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/v2/clusters/${clusterId}/actions/install`);

export const postResetCluster = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/v2/clusters/${clusterId}/actions/reset`);

export const postCancelInstallation = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/v2/clusters/${clusterId}/actions/cancel`);

export const createClusterDownloadsImage = (
  id: string,
  params: ImageCreateParams,
  axiosOptions: AxiosRequestConfig,
): AxiosPromise<Cluster> => client.post(`/v1/clusters/${id}/downloads/image`, params, axiosOptions);

// TODO(jtomasek): make the API_ROOT configurable so this can be used in cloud.redhat.com
const API_ROOT = process.env.REACT_APP_API_ROOT || BASE_PATH;

type getPresignedFileUrlProps = {
  clusterId: string;
  fileName: 'logs' | 'kubeconfig' | 'kubeconfig-noingress';
  hostId?: string;
  logsType?: LogsType;
};
export const getPresignedFileUrl = ({
  clusterId,
  fileName,
  hostId,
  logsType,
}: getPresignedFileUrlProps): AxiosPromise<Presigned> =>
  client.get(
    `/v1/clusters/${clusterId}/downloads/files-presigned?file_name=${fileName}${
      logsType ? `&logs_type=${logsType}` : ''
    }${hostId ? `&host_id=${hostId}` : ''}`,
  );

export const getClusterCredentialsDownload = (
  clusterId: Cluster['id'],
  fileName: string,
): AxiosPromise =>
  client.get(`/v2/clusters/${clusterId}/downloads/credentials?file_name=${fileName}`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/octet-stream',
    },
  });

export const getClusterDownloadsImageUrl = (clusterId: string) =>
  `${API_ROOT}/v1/clusters/${clusterId}/downloads/image`;

export const getClusterCredentials = (clusterID: string): AxiosPromise<Credentials> =>
  client.get(`/v1/clusters/${clusterID}/credentials`);

export const getHostLogsDownloadUrl = (hostId: string, clusterId?: string) => {
  return `${API_ROOT}/v2/clusters/${clusterId}/logs?logs_type=host&host_id=${hostId}`;
};

export const getClusterLogsDownloadUrl = (clusterId: string) => {
  return `${API_ROOT}/v2/clusters/${clusterId}/logs?logs_type=all`;
};

export const getEvents = (
  clusterID: Event['clusterId'],
  hostID: Event['hostId'],
): AxiosPromise<EventList> =>
  client.get(`/v1/clusters/${clusterID}/events${hostID ? `?host_id=${hostID}` : ''}`);

export const getClusterPreflightRequirements = (
  clusterID: Cluster['id'],
): AxiosPromise<PreflightHardwareRequirements> =>
  client.get(`/v1/clusters/${clusterID}/preflight-requirements`);

export const getClusterSupportedPlatforms = (
  clusterID: Cluster['id'],
): AxiosPromise<PlatformType[]> => client.get(`/v1/clusters/${clusterID}/supported-platforms`);
