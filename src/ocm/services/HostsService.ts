import { canInstallHost, Cluster, Disk, DiskRole, Host, HostUpdateParams } from '../../common';
import { AxiosError, AxiosPromise } from 'axios';
import InfraEnvsService from './InfraEnvsService';
import { HostsAPI } from '../services/apis';
import { APIErrorMixin } from '../api/types';

const HostsService = {
  /**
   * Deletes all the hosts in the given cluster
   * @param clusterId
   */
  async deleteAll(clusterId: Cluster['id']) {
    try {
      const promises: AxiosPromise<void>[] = [];
      const hosts = await HostsService.listHostsBoundToCluster(clusterId);
      const hostDeleteParams = hosts.map<[string, string]>(({ infraEnvId, id }) => [
        infraEnvId || '',
        id,
      ]);

      for (const hostDeleteParam of hostDeleteParams) {
        promises.push(HostsAPI.deregister(...hostDeleteParam));
      }

      return Promise.all(promises);
    } catch (e) {
      throw e as AxiosError<APIErrorMixin>;
    }
  },

  /**
   * Retrieves all the hosts that are bound to the given cluster
   * @param clusterId
   */
  async listHostsBoundToCluster(clusterId: Cluster['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    const { data: hosts } = await HostsAPI.list(infraEnvId);
    return hosts.filter((host) => host.clusterId === clusterId);
  },

  async update(clusterId: Cluster['id'], hostId: Host['id'], params: HostUpdateParams) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    HostsAPI.abortLastGetRequest();
    return HostsAPI.update(infraEnvId, hostId, params);
  },

  updateHostName(
    clusterId: Cluster['id'],
    hostId: Host['id'],
    newHostName: HostUpdateParams['hostName'],
  ) {
    return HostsService.update(clusterId, hostId, { hostName: newHostName });
  },

  updateRole(
    clusterId: Cluster['id'],
    hostId: Host['id'],
    newHostRole: HostUpdateParams['hostRole'],
  ) {
    return HostsService.update(clusterId, hostId, { hostRole: newHostRole });
  },

  updateHostODF(
    clusterId: Cluster['id'],
    hostId: Host['id'],
    newNodeLabels: HostUpdateParams['nodeLabels'],
  ) {
    return HostsService.update(clusterId, hostId, { nodeLabels: newNodeLabels }); //need to edit that
  },

  updateDiskRole(
    clusterId: Cluster['id'],
    hostId: Host['id'],
    diskId: Required<Disk>['id'],
    newDiskRole: DiskRole,
  ) {
    return HostsService.update(clusterId, hostId, {
      disksSelectedConfig: [{ id: diskId, role: newDiskRole }],
    });
  },

  updateFormattingDisks(
    clusterId: Cluster['id'],
    hostId: Host['id'],
    diskIdValue: Required<Disk>['id'],
    shouldSkipFormat: boolean,
  ) {
    return HostsService.update(clusterId, hostId, {
      disksSkipFormatting: [{ diskId: diskIdValue, skipFormatting: shouldSkipFormat }],
    });
  },

  async delete(clusterId: Cluster['id'], hostId: Host['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    return HostsAPI.deregister(infraEnvId, hostId);
  },

  async reset(clusterId: Cluster['id'], hostId: Host['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    return HostsAPI.reset(infraEnvId, hostId);
  },

  async install(clusterId: Cluster['id'], hostId: Host['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    return HostsAPI.installHost(infraEnvId, hostId);
  },

  async installAll(cluster: Cluster) {
    try {
      const promises: AxiosPromise<Host>[] = [];
      const infraEnvId = await InfraEnvsService.getInfraEnvId(cluster.id);
      const hosts = await HostsService.listHostsBoundToCluster(cluster.id);

      for (const host of hosts) {
        if (canInstallHost(cluster, host.status)) {
          promises.push(HostsAPI.installHost(infraEnvId, host.id));
        }
      }

      return Promise.all(promises);
    } catch (e) {
      throw e as AxiosError<APIErrorMixin>;
    }
  },
};

export default HostsService;
