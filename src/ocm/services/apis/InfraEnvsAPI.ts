import { client } from '../../api';
import { InfraEnv, InfraEnvCreateParams } from '../../../common';
import { AxiosResponse } from 'axios';

const InfraEnvsAPI = {
  getBaseURI(infraEnvId?: InfraEnv['id']) {
    return `/v2/infra-envs/${infraEnvId ? `/${infraEnvId}` : ''}`;
  },

  list() {
    return client.get<InfraEnv[]>(`${InfraEnvsAPI.getBaseURI()}`);
  },

  register(params: InfraEnvCreateParams) {
    return client.post<InfraEnvCreateParams, AxiosResponse<InfraEnv>>(
      `${InfraEnvsAPI.getBaseURI()}`,
      params,
    );
  },

  deregister(infraEnvId: InfraEnv['id']) {
    return client.delete<void>(`${InfraEnvsAPI.getBaseURI(infraEnvId)}`);
  },
};

export default InfraEnvsAPI;
