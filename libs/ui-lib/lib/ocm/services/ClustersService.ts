import type { ClusterCreateParamsWithStaticNetworking } from './types';
import type {
  CustomManifestValues,
  ListManifestsExtended,
} from '../components/clusterConfiguration/manifestsConfiguration/data/dataTypes';
import type {
  Cluster,
  Host,
  InfraEnvCreateParams,
  UpdateManifestParams,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import omit from 'lodash-es/omit.js';
import ClustersAPI from '../../common/api/assisted-service/ClustersAPI';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import {
  AI_ASSISTED_MIGRATION_TAG,
  AI_CISCO_INTERSIGHT_TAG,
  AI_UI_TAG,
} from '../../common/config/constants';
import { isInOcm } from '../../common/api/axiosClient';

const ClustersService = {
  findHost(hosts: Cluster['hosts'] = [], hostId: Host['id']) {
    return hosts.find((host) => host.id === hostId);
  },

  async create(params: ClusterCreateParamsWithStaticNetworking, isAssistedMigration?: boolean) {
    if (isAssistedMigration) {
      params.tags = AI_ASSISTED_MIGRATION_TAG;
    }
    const { data: cluster } = await ClustersAPI.register(omit(params, 'staticNetworkConfig'));
    const infraEnvCreateParams: InfraEnvCreateParams = {
      name: `${params.name}_infra-env`,
      pullSecret: params.pullSecret,
      clusterId: cluster.id,
      openshiftVersion: params.openshiftVersion,
      cpuArchitecture: params.cpuArchitecture as InfraEnvCreateParams['cpuArchitecture'],
      staticNetworkConfig: params.staticNetworkConfig,
    };

    if (params.platform?.type === 'external' && params.platform.external?.platformName === 'oci') {
      infraEnvCreateParams.imageType = 'minimal-iso';
    }

    await InfraEnvsService.create(infraEnvCreateParams);

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

  async downloadLogs(
    clusterId: Cluster['id'],
    hostId?: Host['id'],
  ): Promise<{
    data: Blob;
    fileName: string | undefined;
  }> {
    const { data, headers } = await ClustersAPI.downloadLogs(clusterId, hostId);
    const contentHeader: string | undefined = headers['content-disposition'] as string | undefined;
    const fileName: string | undefined = contentHeader?.match(/filename="(.+)"/)?.[1];
    return { data, fileName };
  },

  update(clusterId: Cluster['id'], clusterTags: Cluster['tags'], params: V2ClusterUpdateParams) {
    ClustersAPI.abortLastGetRequest();
    if (isInOcm) {
      params = ClustersService.updateClusterTags(clusterTags, params);
    }
    return ClustersAPI.update(clusterId, params);
  },

  async install(clusterId: Cluster['id'], clusterTags: Cluster['tags']) {
    if (isInOcm) {
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
      if (params.tags && params.tags.includes(AI_CISCO_INTERSIGHT_TAG)) {
        tags?.push(AI_CISCO_INTERSIGHT_TAG);
        params.tags = tags?.join(',');
      } else {
        delete params.tags;
      }
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
      content: window.btoa(manifest.manifestYaml),
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
      updatedContent: window.btoa(updatedManifest.manifestYaml),
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
