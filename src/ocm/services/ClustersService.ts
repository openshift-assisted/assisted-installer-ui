import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import { Cluster, Host } from '../../common';
import { saveAs } from 'file-saver';

const ClustersService = {
  async delete(clusterId: Cluster['id']) {
    await HostsService.deleteAll(clusterId);
    await ClustersAPI.deregister(clusterId);
    await InfraEnvsService.delete(clusterId);
  },

  async saveLogs(clusterId?: Cluster['id'], hostId?: Host['id']) {
    if (clusterId) {
      const response = await ClustersAPI.downloadLogs(clusterId, hostId);
      const contentHeader = response.headers.contentDisposition;
      const name = contentHeader?.match(/filename="(.+)"/)?.[1];
      saveAs(response.data, name);
    }
  },
};

export default ClustersService;
