import { Host, HostUpdateParams, InfraEnv } from '../../../common';
import { client } from '../../api';
import { AxiosResponse } from 'axios';
import InfraEnvsAPI from './InfraEnvsAPI';

let _getRequestAbortController = new AbortController();

const HostsAPI = {
  abortLastGetRequest() {
    _getRequestAbortController.abort();
    /**
     * The AbortController.signal can only be aborted once per instance.
     * Therefore in order for other requests to be also abortable we need
     * to create a new instance when this event occurs
     */
    _getRequestAbortController = new AbortController();
  },

  makeBaseURI(infraEnvId: InfraEnv['id'], hostId?: Host['id']) {
    return `${InfraEnvsAPI.makeBaseURI(infraEnvId)}/hosts/${hostId ? hostId : ''}`;
  },

  makeActionsBaseURI(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return `${HostsAPI.makeBaseURI(infraEnvId, hostId)}/actions`;
  },

  list(infraEnvId: InfraEnv['id']) {
    return client.get<Host[]>(`${HostsAPI.makeBaseURI(infraEnvId)}`, {
      signal: _getRequestAbortController.signal,
    });
  },

  get(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.get<Host>(`${HostsAPI.makeBaseURI(infraEnvId, hostId)}`, {
      signal: _getRequestAbortController.signal,
    });
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
