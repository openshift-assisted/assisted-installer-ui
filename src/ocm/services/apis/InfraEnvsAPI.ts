import { client } from '../../api';
import {
  InfraEnv,
  InfraEnvCreateParams,
  PresignedUrl,
  InfraEnvUpdateParams,
} from '../../../common';
import { AxiosResponse } from 'axios';

let _getRequestAbortController = new AbortController();

const InfraEnvsAPI = {
  abortLastGetRequest() {
    _getRequestAbortController.abort();
    /*
     * The AbortController.signal can only be aborted once per instance.
     * Therefore in order for other requests to be also abortable we need
     * to create a new instance when this event occurs
     */
    _getRequestAbortController = new AbortController();
  },

  makeBaseURI(infraEnvId?: InfraEnv['id']) {
    return `/v2/infra-envs/${infraEnvId ? infraEnvId : ''}`;
  },

  /**
   * Retrieves the list of infra-envs.
   * @param clusterId If provided, returns only infra-envs which directly reference the given clusterId.
   */
  list(clusterId = '') {
    const query = clusterId && `?${new URLSearchParams({ ['cluster_id']: clusterId }).toString()}`;
    return client.get<InfraEnv[]>(`${InfraEnvsAPI.makeBaseURI()}${query}`, {
      signal: _getRequestAbortController.signal,
    });
  },

  get(infraEnvId: InfraEnv['id']) {
    return client.get<InfraEnv>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}`, {
      signal: _getRequestAbortController.signal,
    });
  },

  update(infraEnvId: InfraEnv['id'], params: InfraEnvUpdateParams) {
    return client.patch<InfraEnv, AxiosResponse<InfraEnv>, InfraEnvUpdateParams>(
      `${InfraEnvsAPI.makeBaseURI(infraEnvId)}`,
      params,
    );
  },

  register(params: InfraEnvCreateParams) {
    return client.post<InfraEnv, AxiosResponse<InfraEnv>, InfraEnvCreateParams>(
      `${InfraEnvsAPI.makeBaseURI()}`,
      params,
    );
  },

  deregister(infraEnvId: InfraEnv['id']) {
    return client.delete<void>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}`);
  },

  getImageUrl(infraEnvId: InfraEnv['id']) {
    return client.get<PresignedUrl>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}/downloads/image-url`);
  },
  getIpxeImageUrl(infraEnvId: InfraEnv['id']) {
    return client.get<PresignedUrl>(
      `${InfraEnvsAPI.makeBaseURI(infraEnvId)}/downloads/files-presigned?file_name=ipxe-script`,
    );
  },
};

export default InfraEnvsAPI;
