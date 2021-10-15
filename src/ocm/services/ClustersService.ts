import { ClustersAPI } from '../services/apis';
import HostsService from './HostsService';
import InfraEnvsService from './InfraEnvsService';
import { Cluster } from '../../common';

const ClustersService = {
  async delete(clusterId: Cluster['id']) {
    await HostsService.deleteAll(clusterId);
    await ClustersAPI.deregister(clusterId);
    await InfraEnvsService.delete(clusterId);
  },
};

export default ClustersService;
