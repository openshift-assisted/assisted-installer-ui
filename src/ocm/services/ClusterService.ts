import type { AxiosPromise } from 'axios';
import { Cluster } from '../../common';
import { client } from '../api/axiosClient';

const ClusterService = {
  list(): AxiosPromise<Cluster[]> {
    return client.get('/v2/clusters');
  },

  deregister(id: string): AxiosPromise<void> {
    return client.delete(`/v2/clusters/${id}`);
  },

  install(id: Cluster['id']): AxiosPromise<Cluster> {
    return client.post(`/v2/clusters/${id}/actions/install`);
  },

  cancel(id: Cluster['id']): AxiosPromise<Cluster> {
    return client.post(`/v2/clusters/${id}/actions/cancel`);
  },

  reset(id: Cluster['id']): AxiosPromise<Cluster> {
    return client.post(`/v2/clusters/${id}/actions/reset`);
  },
};

export default ClusterService;
