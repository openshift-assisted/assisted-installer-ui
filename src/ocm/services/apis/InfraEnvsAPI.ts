import { client } from '../../api';
import {
  InfraEnv,
  InfraEnvCreateParams,
  InfraEnvImageUrl,
  InfraEnvUpdateParams,
} from '../../../common';
import { AxiosResponse } from 'axios';

const InfraEnvsAPI = {
  makeBaseURI(infraEnvId?: InfraEnv['id']) {
    return `/v2/infra-envs/${infraEnvId ? infraEnvId : ''}`;
  },

  /**
   * Retrieves the list of infra-envs.
   * @param clusterId If provided, returns only infra-envs which directly reference the given clusterId.
   */
  list(clusterId = '') {
    const query = clusterId && `?${new URLSearchParams({ ['cluster_id']: clusterId })}`;
    return client.get<InfraEnv[]>(`${InfraEnvsAPI.makeBaseURI()}${query}`);
  },

  get(infraEnvId: InfraEnv['id']) {
    return client.get<InfraEnv>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}`);
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
    return client.get<InfraEnvImageUrl>(
      `${InfraEnvsAPI.makeBaseURI(infraEnvId)}/downloads/image-url`,
    );
  },
};

export default InfraEnvsAPI;
