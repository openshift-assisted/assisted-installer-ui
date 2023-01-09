import { client } from '../../api/axiosClient';
import {
  Cluster,
  ClusterCreateParams,
  ClusterDefaultConfig,
  V2ClusterUpdateParams,
  Credentials,
  Host,
  ImportClusterParams,
  PlatformType,
  PreflightHardwareRequirements,
  PresignedUrl,
} from '../../../common/api/types';
import { AxiosResponse } from 'axios';
import { ClustersAPIGetPresignedOptions } from './types';

let _getRequestAbortController = new AbortController();

const ClustersAPI = {
  abortLastGetRequest() {
    _getRequestAbortController.abort();
    /**
     * The AbortController.signal can only be aborted once per instance.
     * Therefore in order for other requests to be also abortable we need
     * to create a new instance when this event occurs
     */
    _getRequestAbortController = new AbortController();
  },

  makeBaseURI(clusterId?: Cluster['id']) {
    return `/v2/clusters/${clusterId ? clusterId : ''}`;
  },

  makeDownloadsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/downloads`;
  },

  makeLogsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/logs`;
  },

  makeDownloadsCredentialsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeDownloadsBaseURI(clusterId)}/credentials`;
  },

  makeDownloadsCredentialsPresignedBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeDownloadsBaseURI(clusterId)}/credentials-presigned`;
  },

  makeDownloadsFilesPresignedBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeDownloadsBaseURI(clusterId)}/files-presigned`;
  },

  makeSupportedPlatformsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/supported-platforms`;
  },

  makeActionsBaseURI(clusterId: string) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/actions`;
  },

  downloadClusterCredentials(clusterId: Cluster['id'], fileName: string) {
    return client.get<Blob>(
      `${ClustersAPI.makeDownloadsCredentialsBaseURI(clusterId)}?file_name=${fileName}`,
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
  }: ClustersAPIGetPresignedOptions) {
    const queryParams = `${logsType ? `&logs_type=${logsType}` : ''}${
      hostId ? `&host_id=${hostId}` : ''
    }`;
    return client.get<PresignedUrl>(
      `${ClustersAPI.makeDownloadsCredentialsPresignedBaseURI(
        clusterId,
      )}?file_name=${fileName}${queryParams}`,
    );
  },

  getPresignedForClusterFiles({
    clusterId,
    fileName,
    hostId,
    logsType,
  }: ClustersAPIGetPresignedOptions) {
    const queryParams = `${logsType ? `&logs_type=${logsType}` : ''}${
      hostId ? `&host_id=${hostId}` : ''
    }`;
    return client.get<PresignedUrl>(
      `${ClustersAPI.makeDownloadsFilesPresignedBaseURI(
        clusterId,
      )}?file_name=${fileName}${queryParams}`,
    );
  },

  list() {
    return client.get<Cluster[]>(`${ClustersAPI.makeBaseURI()}`, {
      signal: _getRequestAbortController.signal,
    });
  },

  get(clusterId: Cluster['id']) {
    return client.get<Cluster>(`${ClustersAPI.makeBaseURI(clusterId)}`, {
      signal: _getRequestAbortController.signal,
    });
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
    return client.post<Cluster, AxiosResponse<Cluster>, ClusterCreateParams>(
      `${ClustersAPI.makeBaseURI()}`,
      params,
    );
  },

  update(clusterId: Cluster['id'], params: V2ClusterUpdateParams) {
    return client.patch<Cluster, AxiosResponse<Cluster>, V2ClusterUpdateParams>(
      `${ClustersAPI.makeBaseURI(clusterId)}`,
      params,
    );
  },

  install(clusterId: Cluster['id']) {
    return client.post<Cluster, AxiosResponse<Cluster>, never>(
      `${ClustersAPI.makeActionsBaseURI(clusterId)}/install`,
    );
  },

  cancel(clusterId: Cluster['id']) {
    return client.post<Cluster, AxiosResponse<Cluster>, never>(
      `${ClustersAPI.makeActionsBaseURI(clusterId)}/cancel`,
    );
  },

  reset(clusterId: Cluster['id']) {
    return client.post<Cluster, AxiosResponse<Cluster>, never>(
      `${ClustersAPI.makeActionsBaseURI(clusterId)}/reset`,
    );
  },

  registerAddHosts(params: ImportClusterParams) {
    return client.post<Cluster, AxiosResponse<Cluster>, ImportClusterParams>(
      `${ClustersAPI.makeBaseURI()}import`,
      params,
    );
  },

  allowAddHosts(clusterId: Cluster['id']) {
    return client.post<Cluster, AxiosResponse<Cluster>, never>(
      `${ClustersAPI.makeActionsBaseURI(clusterId)}/allow-add-workers`,
    );
  },

  downloadLogs(clusterId: Cluster['id'], hostId?: Host['id']) {
    const queryParams = `logs_type=${!hostId ? 'all' : `host&host_id=${hostId}`}`;
    return client.get<Blob>(`${ClustersAPI.makeLogsBaseURI(clusterId)}?${queryParams}`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/octet-stream',
      },
    });
  },

  getCredentials(clusterId: Cluster['id']) {
    return client.get<Credentials>(`${ClustersAPI.makeBaseURI(clusterId)}/credentials`);
  },

  listByOpenshiftId(openshiftId: Cluster['openshiftClusterId']) {
    return client.get<Cluster[]>(
      `${ClustersAPI.makeBaseURI()}?openshift_cluster_id=${openshiftId || ''}`,
    );
  },

  listBySubscriptionIds(subscriptionIds: Cluster['amsSubscriptionId'][]) {
    return client.get<Cluster[]>(
      `${ClustersAPI.makeBaseURI()}?ams_subscription_ids=${subscriptionIds.toString()}`,
    );
  },
};

export default ClustersAPI;
