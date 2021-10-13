import { Cluster, ClusterCreateParams } from '../../common';
import { client } from '../api';
import { AxiosResponse } from 'axios';

const ClusterService = {
  list() {
    return client.get<Cluster[]>('/v2/clusters');
  },

  deregister(id: string) {
    return client.delete<void>(`/v2/clusters/${id}`);
  },

  register(params: ClusterCreateParams) {
    return client.post<ClusterCreateParams, AxiosResponse<Cluster>>('/v2/clusters', params);
  },
};

export default ClusterService;
