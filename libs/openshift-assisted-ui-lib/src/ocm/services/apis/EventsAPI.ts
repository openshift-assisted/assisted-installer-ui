import { EventList } from '../../../common';
import { client } from '../../api';
import { EventsAPIListOptions } from './types';

const EventsAPI = {
  makeBaseURI() {
    return '/v2/events';
  },

  list(options: EventsAPIListOptions) {
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

    return client.get<EventList>(`${EventsAPI.makeBaseURI()}${queryParams}`);
  },
};

export default EventsAPI;
