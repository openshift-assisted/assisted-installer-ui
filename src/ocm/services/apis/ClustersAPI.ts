import { client } from '../../api';
import { Cluster, ClusterCreateParams, ClusterUpdateParams, PlatformType } from '../../../common';
import { AxiosResponse } from 'axios';
import APIVersionService from '../APIVersionService';

const ClustersAPI = {
  makeBaseURI(clusterId?: Cluster['id']) {
    return `/v${APIVersionService.version}/clusters/${clusterId ? clusterId : ''}`;
  },

  makeSupportedPlatformsBaseURI(clusterId: Cluster['id']) {
    return `${ClustersAPI.makeBaseURI(clusterId)}/supported-platforms`;
  },

  list() {
    return client.get<Cluster[]>(`${ClustersAPI.makeBaseURI()}`);
  },

  get(clusterId: Cluster['id']) {
    return client.get<Cluster>(`${ClustersAPI.makeBaseURI(clusterId)}`);
  },

  getSupportedPlatforms(clusterId: Cluster['id']) {
    return client.get<PlatformType[]>(`${ClustersAPI.makeBaseURI(clusterId)}/supported-platforms`);
  },

  getDefaultConfig() {
    return `${ClustersAPI.makeBaseURI()}/default-config`;
  },

  deregister(clusterId: Cluster['id']) {
    return client.delete<void>(`${ClustersAPI.makeBaseURI(clusterId)}`);
  },

  register(params: ClusterCreateParams) {
    return client.post<ClusterCreateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.makeBaseURI()}`,
      params,
    );
  },

  update(clusterId: Cluster['id'], params: ClusterUpdateParams) {
    return client.patch<ClusterUpdateParams, AxiosResponse<Cluster>>(
      `${ClustersAPI.makeBaseURI(clusterId)}`,
      params,
    );
  },
};

export default ClustersAPI;
