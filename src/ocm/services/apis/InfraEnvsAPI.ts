import { client } from '../../api';
import { InfraEnv, InfraEnvCreateParams, InfraEnvUpdateParams } from '../../../common';
import { AxiosResponse } from 'axios';
import APIVersionService from '../APIVersionService';

const InfraEnvsAPI = {
  makeBaseURI(infraEnvId?: InfraEnv['id']) {
    return `/v${APIVersionService.version}/infra-envs/${infraEnvId ? infraEnvId : ''}`;
  },

  list() {
    return client.get<InfraEnv[]>(`${InfraEnvsAPI.makeBaseURI()}`);
  },

  get(infraEnvId: InfraEnv['id']) {
    return client.get<InfraEnv>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}`);
  },

  patch(infraEnvId: InfraEnv['id'], params: InfraEnvUpdateParams) {
    return client.patch<InfraEnvUpdateParams, AxiosResponse<InfraEnv>>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}`, params);
  },

  register(params: InfraEnvCreateParams) {
    return client.post<InfraEnvCreateParams, AxiosResponse<InfraEnv>>(
      `${InfraEnvsAPI.makeBaseURI()}`,
      params,
    );
  },

  deregister(infraEnvId: InfraEnv['id']) {
    return client.delete<void>(`${InfraEnvsAPI.makeBaseURI(infraEnvId)}`);
  },
};

export default InfraEnvsAPI;
