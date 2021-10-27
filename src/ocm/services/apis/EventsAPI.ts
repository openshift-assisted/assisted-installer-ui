import { EventList } from '../../../common';
import { client } from '../../api';
import APIVersionService from '../APIVersionService';
import { EventAPIListOptions } from './types';

const EventsAPI = {
  list(options: EventAPIListOptions) {
    let queryParams = '?';

    queryParams += options.clusterId ? `cluster_id=${options.clusterId}&` : '';
    queryParams += options.hostId ? `host_id=${options.hostId}&` : '';
    queryParams += options.infraEnvId ? `infra_env_id=${options.infraEnvId}&` : '';
    if (options.categories) {
      queryParams += `categories=`;
      options.categories.forEach((category) => {
        queryParams += `${category},`;
      });
    }
    queryParams = queryParams.slice(0, -1);

    return client.get<EventList>(`/v${APIVersionService.version}/events${queryParams}`);
  },
};

export default EventsAPI;
