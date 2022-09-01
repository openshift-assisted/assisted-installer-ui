import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import { AI_UI_TAG, Cluster, Host, V2ClusterUpdateParams } from '../../common';
import { ocmClient } from '../api';

const ClustersService = {
  async delete(clusterId: Cluster['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);

    if (infraEnvId === clusterId) {
      await ClustersAPI.deregister(clusterId);
    } else {
      await HostsService.deleteAll(clusterId);
      await ClustersAPI.deregister(clusterId);
      await InfraEnvsService.delete(clusterId);
    }
  },

  async downloadLogs(clusterId: Cluster['id'], hostId?: Host['id']) {
    const { data, headers } = await ClustersAPI.downloadLogs(clusterId, hostId);
    const contentHeader = headers['content-disposition'];
    const fileName = contentHeader?.match(/filename="(.+)"/)?.[1];
    return { data, fileName };
  },

  async update(
    clusterId: Cluster['id'],
    clusterTags: Cluster['tags'],
    params: V2ClusterUpdateParams,
  ) {
    if (ocmClient) {
      params = ClustersService.updateClusterTags(clusterTags, params);
    }
    return ClustersAPI.update(clusterId, params);
  },

  async install(clusterId: Cluster['id'], clusterTags: Cluster['tags']) {
    if (ocmClient) {
      const params = ClustersService.updateClusterTags(clusterTags, {});
      if (params.tags) {
        await ClustersService.update(clusterId, clusterTags, {});
      }
    }

    return ClustersAPI.install(clusterId);
  },

  updateClusterTags(
    clusterTags: Cluster['tags'],
    params: V2ClusterUpdateParams,
  ): V2ClusterUpdateParams {
    const tags = clusterTags?.split(',') || <string[]>[];
    if (tags.includes(AI_UI_TAG)) {
      delete params.tags;
    } else {
      tags?.push(AI_UI_TAG);
      params.tags = tags?.join(',');
    }
    return params;
  },
};

export default ClustersService;
