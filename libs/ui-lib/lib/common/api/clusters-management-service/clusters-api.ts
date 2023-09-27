import { ocmClient as client } from '../axiosClient';
import { Cluster } from '@openshift-assisted/sdks/clusters-management-service';

export const ClustersAPI = {
  makeBaseURI() {
    return '/api/clusters_mgmt/v1/clusters';
  },

  async getClustersDetails(clusterId: string) {
    const response = await client?.get<Cluster>(`${ClustersAPI.makeBaseURI()}/${clusterId}`);
    return response?.data;
  },
};
