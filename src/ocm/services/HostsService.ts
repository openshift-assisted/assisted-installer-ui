import { Disk, DiskRole, Host, HostUpdateParams } from '../../common';
import { HostsAPI } from '../services/apis';

const HostsService = {
  /**
   * Removes all the hosts in the list assuming
   * all of them have a valid infraEnvId value.
   * @param hosts
   */
  removeAll(hosts: Host[]) {
    const promises = [];

    for (const { id, infraEnvId } of hosts) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      promises.push(HostsAPI.deregister(infraEnvId!, id));
    }

    return Promise.all(promises);
  },

  update(host: Host, params: HostUpdateParams) {
    HostsAPI.abortLastGetRequest();
    if (!host.infraEnvId) {
      throw new Error(`Cannot update host ${host.id}, missing infraEnvId`);
    }

    return HostsAPI.update(host.infraEnvId, host.id, params);
  },

  updateHostName(host: Host, newHostName: HostUpdateParams['hostName']) {
    return HostsService.update(host, { hostName: newHostName });
  },

  updateRole(host: Host, newHostRole: HostUpdateParams['hostRole']) {
    return HostsService.update(host, { hostRole: newHostRole });
  },

  updateHostODF(host: Host, newNodeLabels: HostUpdateParams['nodeLabels']) {
    return HostsService.update(host, { nodeLabels: newNodeLabels }); //need to edit that
  },

  updateDiskRole(host: Host, diskId: Required<Disk>['id'], newDiskRole: DiskRole) {
    const params: HostUpdateParams = {
      disksSelectedConfig: [{ id: diskId, role: newDiskRole }],
    };
    if (newDiskRole === 'install') {
      params.disksSkipFormatting = [{ diskId, skipFormatting: false }];
    }
    return HostsService.update(host, params);
  },

  updateFormattingDisks(host: Host, diskIdValue: Required<Disk>['id'], shouldSkipFormat: boolean) {
    return HostsService.update(host, {
      disksSkipFormatting: [{ diskId: diskIdValue, skipFormatting: shouldSkipFormat }],
    });
  },

  delete(host: Host) {
    if (!host.infraEnvId) {
      throw new Error(`Cannot delete host ${host.id}, missing infraEnvId`);
    }

    return HostsAPI.deregister(host.infraEnvId, host.id);
  },

  reset(host: Host) {
    if (!host.infraEnvId) {
      throw new Error(`Cannot reset host ${host.id}, missing infraEnvId`);
    }

    return HostsAPI.reset(host.infraEnvId, host.id);
  },

  install(host: Host) {
    if (!host.infraEnvId) {
      throw new Error(`Cannot install host ${host.id}, missing infraEnvId`);
    }

    return HostsAPI.installHost(host.infraEnvId, host.id);
  },

  installAll(hosts: Host[]) {
    const promises = [];
    for (const host of hosts) {
      promises.push(HostsService.install(host));
    }

    return Promise.all(promises);
  },
};

export default HostsService;
