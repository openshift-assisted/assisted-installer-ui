import { EventList, V2Events } from '../../../common/api/types';
import { client } from '../../api/axiosClient';

let _getRequestAbortController = new AbortController();

const EventsAPI = {
  makeBaseURI() {
    return '/v2/events';
  },

  abort() {
    _getRequestAbortController.abort();
    /*
     * The AbortController.signal can only be aborted once per instance.
     * Therefore in order for other requests to be also abortable we need
     * to create a new instance when this event occurs
     */
    _getRequestAbortController = new AbortController();
  },

  createParams({
    clusterId,
    hostIds,
    infraEnvId,
    severities,
    deletedHosts = true,
    clusterLevel = true,
    message,
    limit = 10,
    offset = 0,
  }: V2Events) {
    let params = '?';
    params += 'order=descending&';

    params += clusterId ? `cluster_id=${clusterId}&` : '';
    params += hostIds?.length ? `host_ids=${hostIds.join(',')}&` : '';
    params += infraEnvId ? `infra_env_id=${infraEnvId}&` : '';

    params += severities?.length ? `severities=${severities?.join(',')}&` : '';
    params += deletedHosts ? `deleted_hosts=${deletedHosts.toString()}&` : '';
    params += clusterLevel ? `cluster_level=${clusterLevel.toString()}&` : '';
    params += message ? `message=${encodeURIComponent(message)}&` : '';

    params += `limit=${limit}&`;
    params += `offset=${offset}`;

    return params;
  },

  list(options: V2Events) {
    return client.get<EventList>(`${EventsAPI.makeBaseURI()}${EventsAPI.createParams(options)}`, {
      signal: _getRequestAbortController.signal,
    });
  },
};

export default EventsAPI;
