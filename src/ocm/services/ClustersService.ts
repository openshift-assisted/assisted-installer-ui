import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import {
  AI_UI_TAG,
  Cluster,
  CreateManifestParams,
  Host,
  UpdateManifestParams,
  V2ClusterUpdateParams,
} from '../../common';
import { ocmClient } from '../api';
import { ClusterCreateParamsWithStaticNetworking } from './types';
import omit from 'lodash/omit';
import {
  CustomManifestValues,
  ListManifestsExtended,
} from '../components/clusterConfiguration/manifestsConfiguration/data/dataTypes';

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

  transformFormViewManifest(manifest: CustomManifestValues) {
    return {
      folder: manifest.folder,
      fileName: manifest.filename,
      content: Buffer.from(manifest.manifestYaml).toString('base64'),
    };
  },

  getUpdateManifestParams(
    existingManifest: CustomManifestValues,
    updatedManifest: CustomManifestValues,
  ): UpdateManifestParams {
    return {
      folder: existingManifest.folder,
      fileName: existingManifest.filename,
      updatedFolder: updatedManifest.folder,
      updatedFileName: updatedManifest.filename,
      updatedContent: Buffer.from(updatedManifest.manifestYaml).toString('base64'),
    };
  },

  createClusterManifests(manifests: CustomManifestValues[], clusterId: Cluster['id']) {
    const promises = manifests.map((manifest) => {
      return ClustersAPI.createCustomManifest(clusterId, this.transformFormViewManifest(manifest));
    });
    return Promise.all(promises);
  },

  removeClusterManifests(customManifests: ListManifestsExtended, clusterId: Cluster['id']) {
    const promises = customManifests.map((manifest) => {
      return ClustersAPI.removeCustomManifest(
        clusterId,
        manifest.folder || '',
        manifest.fileName || '',
      );
    });
    return Promise.all(promises);
  },

  createDummyManifest(clusterId: Cluster['id']) {
    const dummyManifest: CreateManifestParams = {
      folder: 'manifests' as 'manifests' | 'openshift',
      fileName: 'manifest1.yaml',
      content: '',
    };
    return ClustersAPI.createCustomManifest(clusterId, dummyManifest);
  },

  updateCustomManifest(
    existingManifest: CustomManifestValues,
    updatedManifest: CustomManifestValues,
    clusterId: Cluster['id'],
  ) {
    return ClustersAPI.updateCustomManifest(
      clusterId,
      this.getUpdateManifestParams(existingManifest, updatedManifest),
    );
  },
};

export default ClustersService;
