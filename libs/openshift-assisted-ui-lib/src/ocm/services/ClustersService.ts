import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import { AI_UI_TAG, Cluster, Host, V2ClusterUpdateParams } from '../../common';
import { ocmClient } from '../api';
import { ClusterCreateParamsWithStaticNetworking } from './types';
import omit from 'lodash/omit';

const ClustersService = {
  findHost(hosts: Cluster['hosts'] = [], hostId: Host['id']) {
    return hosts.find((host) => host.id === hostId);
  },

  async create(params: ClusterCreateParamsWithStaticNetworking) {
    const { data: cluster } = await ClustersAPI.register(omit(params, 'staticNetworkConfig'));
    await InfraEnvsService.create({
      name: `${params.name}_infra-env`,
      pullSecret: params.pullSecret,
      clusterId: cluster.id,
      openshiftVersion: params.openshiftVersion,
      cpuArchitecture: params.cpuArchitecture,
      staticNetworkConfig: params.staticNetworkConfig,
    });

    return cluster;
  },

  async remove(clusterId: Cluster['id']) {
    const { data: cluster } = await ClustersAPI.get(clusterId);
    const hosts = cluster.hosts ?? [];

    if (hosts.length > 0) {
      await HostsService.removeAll(hosts);
    }
    await InfraEnvsService.removeAll(clusterId);
    await ClustersAPI.deregister(clusterId);
  },

  async downloadLogs(clusterId: Cluster['id'], hostId?: Host['id']) {
    const { data, headers } = await ClustersAPI.downloadLogs(clusterId, hostId);
    const contentHeader = headers['content-disposition'];
    const fileName = contentHeader?.match(/filename="(.+)"/)?.[1];
    return { data, fileName };
  },

  update(clusterId: Cluster['id'], clusterTags: Cluster['tags'], params: V2ClusterUpdateParams) {
    ClustersAPI.abortLastGetRequest();
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

  async get(clusterId: Cluster['id']) {
    const { data: cluster } = await ClustersAPI.get(clusterId);
    return cluster;
  },
};

export default ClustersService;
