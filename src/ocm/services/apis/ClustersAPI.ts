import { client } from '../../api/axiosClient';
import {
  AddHostsClusterCreateParams,
  Cluster,
  ClusterCreateParams,
  ClusterDefaultConfig,
  ClusterUpdateParams,
  Host,
  PlatformType,
  PreflightHardwareRequirements,
  Presigned,
} from '../../../common/api/types';
import { AxiosResponse } from 'axios';
import APIVersionService from '../APIVersionService';
import { GetPresignedForClusterCredentialsOptions } from './types';

const ClustersAPI = {
  makeBaseURI(clusterId?: Cluster['id']) {
    return `/v${APIVersionService.version}/clusters/${clusterId ? clusterId : ''}`;
  },

  makeDownloadClusterCredentialsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/downloads/credentials`;
  },

  makeDownloadPresignedBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/downloads/credentials-presigned`;
  },

  makeSupportedPlatformsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/supported-platforms`;
  },

  makeClusterActionsBaseURI(clusterId: string) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/actions`;
  },

  downloadClusterCredentials(clusterId: Cluster['id'], fileName: string) {
    return client.get<Blob>(
      `${ClustersAPI.makeDownloadClusterCredentialsBaseURI(clusterId)}?file_name=${fileName}`,
      {
        responseType: 'blob',
        headers: {
          Accept: 'application/octet-stream',
        },
      },
    );
  },

  getPresignedForClusterCredentials({
    clusterId,
    fileName,
    hostId,
    logsType,
  }: GetPresignedForClusterCredentialsOptions) {
    const queryParams = `${logsType ? `&logs_type=${logsType}` : ''}${
      hostId ? `&host_id=${hostId}` : ''
    }`;
    return client.get<Presigned>(
      `${ClustersAPI.makeDownloadPresignedBaseURI(clusterId)}?file_name=${fileName}${queryParams}`,
    );
  },

  list() {
    return client.get<Cluster[]>(`${ClustersAPI.makeBaseURI()}`);
  },

  get(clusterId: Cluster['id']) {
    return client.get<Cluster>(`${ClustersAPI.makeBaseURI(clusterId)}`);
  },

  getSupportedPlatforms(clusterId: Cluster['id']) {
    return client.get<PlatformType[]>(`${ClustersAPI.makeSupportedPlatformsBaseURI(clusterId)}`);
  },

  getPreflightRequirements(clusterId: Cluster['id']) {
    return client.get<PreflightHardwareRequirements>(
      `${ClustersAPI.makeBaseURI(clusterId)}/preflight-requirements`,
    );
  },

  getDefaultConfig() {
    return client.get<ClusterDefaultConfig>(`${ClustersAPI.makeBaseURI()}/default-config`);
  },

  deregister(clusterId: Cluster['id']) {
    return client.delete<void>(`${ClustersAPI.makeBaseURI(clusterId)}`);
  },

  register(params: ClusterCreateParams) {
    return client.post<ClusterCreateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.makeBaseURI()}`,
      params,
    );
  },

  update(clusterId: Cluster['id'], params: ClusterUpdateParams) {
    return client.patch<ClusterUpdateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.makeBaseURI(clusterId)}`,
      params,
    );
  },

  install(clusterId: Cluster['id']) {
    return client.post<Cluster>(`${ClustersAPI.makeClusterActionsBaseURI(clusterId)}/install`);
  },

  cancel(clusterId: Cluster['id']) {
    return client.post<Cluster>(`${ClustersAPI.makeClusterActionsBaseURI(clusterId)}/cancel`);
  },

  reset(clusterId: Cluster['id']) {
    return client.post<Cluster>(`${ClustersAPI.makeClusterActionsBaseURI(clusterId)}/reset`);
  },

  registerAddHosts(params: AddHostsClusterCreateParams) {
    return client.post<Cluster>(`${ClustersAPI.makeBaseURI()}/import`, params);
  },

  downloadLogs(clusterId: Cluster['id'], hostId?: Host['id']) {
    const queryParams = `logs_type=${!hostId ? 'all' : `host&host_id=${hostId}`}`;
    return client.get<Blob>(`${ClustersAPI.makeBaseURI(clusterId)}/logs?${queryParams}`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/octet-stream',
      },
    });
  },
};

export default ClustersAPI;
