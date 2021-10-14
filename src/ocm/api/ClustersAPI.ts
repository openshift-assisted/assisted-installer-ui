import { client } from './axiosClient';
import { Cluster, ClusterCreateParams, ClusterUpdateParams } from '../../common';
import { AxiosResponse } from 'axios';

const ClustersAPI = {
  getBaseURI(clusterId?: Cluster['id']) {
    return `/v2/clusters/${clusterId ? `/${clusterId}` : ''}`;
  },

  list() {
    return client.get<Cluster[]>(`${ClustersAPI.getBaseURI()}`);
  },

  get(id: string) {
    return client.get<Cluster>(`${ClustersAPI.getBaseURI(id)}`);
  },

  deregister(id: string) {
    return client.delete<void>(`${ClustersAPI.getBaseURI(id)}`);
  },

  register(params: ClusterCreateParams) {
    return client.post<ClusterCreateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.getBaseURI()}`,
      params,
    );
  },

  update(id: string, params: ClusterUpdateParams) {
    return client.patch<ClusterUpdateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.getBaseURI(id)}`,
      params,
    );
  },
};

export default ClustersAPI;
