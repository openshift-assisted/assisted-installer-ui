import { EventList, V2Events } from '../../../common';
import { client } from '../../api';

const EventsAPI = {
  makeBaseURI() {
    return '/v2/events';
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
    params += message ? `message=${message}&` : '';

    params += `limit=${limit}&`;
    params += `offset=${offset}`;

    return params;
  },

  list(options: V2Events) {
    return client.get<EventList>(`${EventsAPI.makeBaseURI()}${EventsAPI.createParams(options)}`);
  },
};

export default EventsAPI;
