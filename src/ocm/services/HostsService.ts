import { Cluster, Disk, DiskRole, Host, HostUpdateParams } from '../../common';
import { AxiosError, AxiosPromise } from 'axios';
import InfraEnvsService from './InfraEnvsService';
import { HostsAPI } from '../services/apis';

const HostsService = {
  /**
   * Deletes all the hosts in the given cluster
   * @param clusterId
   */
  async deleteAll(clusterId: Cluster['id']) {
    try {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
      const response = await HostsAPI.list(infraEnvId);
      const hostIds = response.data?.map((host) => host.id);
      const promises: AxiosPromise<void>[] = [];

      for (const hostId of hostIds) {
        promises.push(HostsAPI.deregister(infraEnvId, hostId));
      }

      return Promise.all(promises);
    } catch (e) {
      throw e as AxiosError<Partial<{ reason: string; message: string }>>;
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

  async delete(clusterId: Cluster['id'], hostId: Host['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    return HostsAPI.deregister(infraEnvId, hostId);
  },

  async reset(clusterId: Cluster['id'], hostId: Host['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    return HostsAPI.reset(infraEnvId, hostId);
  },
};

export default HostsService;
