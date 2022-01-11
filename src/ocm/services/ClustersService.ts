import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import { Cluster, ClusterCreateParams, ClusterDetailsValues, Host } from '../../common';
import _ from 'lodash';
import { DiskEncryptionService } from './index';

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
    const contentHeader = headers.contentDisposition;
    const fileName = contentHeader?.match(/filename="(.+)"/)?.[1];
    return { data, fileName };
  },
};

export default ClustersService;
