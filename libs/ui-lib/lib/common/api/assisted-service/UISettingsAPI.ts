import { clientWithoutCaseConverter as client } from '../../api/axiosClient';
import { Cluster } from '@openshift-assisted/types/./assisted-installer-service';

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const UISettingsAPI = {
  makeBaseURI(clusterId?: Cluster['id']) {
    return `/v2/clusters/${clusterId ? clusterId : ''}/ui-settings`;
  },

  get(clusterId?: Cluster['id']) {
    return client.get<string>(UISettingsAPI.makeBaseURI(clusterId));
  },

  put(clusterId: Cluster['id'], data: string) {
    return client.put<string>(UISettingsAPI.makeBaseURI(clusterId), data, config);
  },
};

export default UISettingsAPI;
