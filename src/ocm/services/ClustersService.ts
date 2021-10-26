import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import { Cluster, Host } from '../../common';

const ClustersService = {
  async delete(clusterId: Cluster['id']) {
    await HostsService.deleteAll(clusterId);
    await ClustersAPI.deregister(clusterId);
    await InfraEnvsService.delete(clusterId);
  },

  async downloadLogs(clusterId: Cluster['id'], hostId?: Host['id']) {
    const { data, headers } = await ClustersAPI.downloadLogs(clusterId, hostId);
    const contentHeader = headers.contentDisposition;
    const fileName = contentHeader?.match(/filename="(.+)"/)?.[1];
    return { data, fileName };
  },
};

export default ClustersService;
