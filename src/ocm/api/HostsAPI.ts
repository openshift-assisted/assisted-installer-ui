import { Host, HostUpdateParams, InfraEnv } from '../../common';
import { client } from './axiosClient';
import { AxiosResponse } from 'axios';

const HostsAPI = {
  getBaseURI(infraEnvId: InfraEnv['id'], hostId?: Host['id']) {
    return `/v2/infra-envs/${infraEnvId}/hosts${hostId ? `/${hostId}` : ''}`;
  },

  list(infraEnvId: InfraEnv['id']) {
    return client.get<Host[]>(`${HostsAPI.getBaseURI(infraEnvId)}`);
  },

  get(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.get<Host>(`${HostsAPI.getBaseURI(infraEnvId, hostId)}`);
  },

  update(infraEnvId: InfraEnv['id'], hostId: Host['id'], params: HostUpdateParams) {
    return client.patch<HostUpdateParams, AxiosResponse<Host>>(
      `${HostsAPI.getBaseURI(infraEnvId, hostId)}`,
      params,
    );
  },

  deregister(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.delete<void>(`${HostsAPI.getBaseURI(infraEnvId, hostId)}`);
  },
};

export default HostsAPI;
