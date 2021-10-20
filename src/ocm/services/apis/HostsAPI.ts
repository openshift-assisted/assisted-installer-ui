import { Host, HostUpdateParams, InfraEnv } from '../../../common';
import { client } from '../../api';
import { AxiosResponse } from 'axios';
import InfraEnvsAPI from './InfraEnvsAPI';

const HostsAPI = {
  makeBaseURI(infraEnvId: InfraEnv['id'], hostId?: Host['id']) {
    return `${InfraEnvsAPI.makeBaseURI(infraEnvId)}/hosts/${hostId ? hostId : ''}`;
  },

  list(infraEnvId: InfraEnv['id']) {
    return client.get<Host[]>(`${HostsAPI.makeBaseURI(infraEnvId)}`);
  },

  get(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.get<Host>(`${HostsAPI.makeBaseURI(infraEnvId, hostId)}`);
  },

  update(infraEnvId: InfraEnv['id'], hostId: Host['id'], params: HostUpdateParams) {
    return client.patch<HostUpdateParams, AxiosResponse<Host>>(
      `${HostsAPI.makeBaseURI(infraEnvId, hostId)}`,
      params,
    );
  },

  deregister(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.delete<void>(`${HostsAPI.makeBaseURI(infraEnvId, hostId)}`);
  },
};

export default HostsAPI;
