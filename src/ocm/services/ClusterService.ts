import { AxiosPromise } from 'axios';
import { Cluster } from '../../common';
import { client } from '../api/axiosClient';

const ClusterService = {
  list(): AxiosPromise<Cluster[]> {
    return client.get('/v2/clusters');
  },

  deregister(id: string): AxiosPromise<void> {
    return client.delete(`/v2/clusters/${id}`);
  },
};

export default ClusterService;
