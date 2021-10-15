import { client } from '../../api';
import { Cluster, ClusterCreateParams, ClusterUpdateParams } from '../../../common';
import { AxiosResponse } from 'axios';

const ClustersAPI = {
  getBaseURI(clusterId?: Cluster['id']) {
    return `/v2/clusters/${clusterId ? `/${clusterId}` : ''}`;
  },

  list() {
    return client.get<Cluster[]>(`${ClustersAPI.getBaseURI()}`);
  },

  get(clusterId: Cluster['id']) {
    return client.get<Cluster>(`${ClustersAPI.getBaseURI(clusterId)}`);
  },

  deregister(clusterId: Cluster['id']) {
    return client.delete<void>(`${ClustersAPI.getBaseURI(clusterId)}`);
  },

  register(params: ClusterCreateParams) {
    return client.post<ClusterCreateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.getBaseURI()}`,
      params,
    );
  },

  update(clusterId: Cluster['id'], params: ClusterUpdateParams) {
    return client.patch<ClusterUpdateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.getBaseURI(clusterId)}`,
      params,
    );
  },
};

export default ClustersAPI;
