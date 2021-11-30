import { Host, HostUpdateParams, InfraEnv } from '../../../common';
import { client } from '../../api';
import { AxiosResponse } from 'axios';
import InfraEnvsAPI from './InfraEnvsAPI';

const HostsAPI = {
  makeBaseURI(infraEnvId: InfraEnv['id'], hostId?: Host['id']) {
    return `${InfraEnvsAPI.makeBaseURI(infraEnvId)}/hosts/${hostId ? hostId : ''}`;
  },

  makeActionsBaseURI(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return `${HostsAPI.makeBaseURI(infraEnvId, hostId)}/actions`;
  },

  list(infraEnvId: InfraEnv['id']) {
    return client.get<Host[]>(`${HostsAPI.makeBaseURI(infraEnvId)}`);
  },

  get(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.get<Host>(`${HostsAPI.makeBaseURI(infraEnvId, hostId)}`);
  },

  update(infraEnvId: InfraEnv['id'], hostId: Host['id'], params: HostUpdateParams) {
    return client.patch<Host, AxiosResponse<Host>, HostUpdateParams>(
      `${HostsAPI.makeBaseURI(infraEnvId, hostId)}`,
      params,
    );
  },

  deregister(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.delete<void>(`${HostsAPI.makeBaseURI(infraEnvId, hostId)}`);
  },

  reset(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.post<Host, AxiosResponse<Host>, never>(
      `${HostsAPI.makeActionsBaseURI(infraEnvId, hostId)}/reset`,
    );
  },

  installHost(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.post<Host, AxiosResponse<Host>, never>(
      `${HostsAPI.makeActionsBaseURI(infraEnvId, hostId)}/install`,
    );
  },
};

export default HostsAPI;
