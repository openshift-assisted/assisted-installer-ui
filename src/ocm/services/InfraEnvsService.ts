import { InfraEnvCreateParams, Cluster } from '../../common';
import { InfraEnvsAPI } from './apis';
import InfraEnvIdsCacheService from './InfraEnvIdsCacheService';

const InfraEnvsService = {
  async getInfraEnvId(clusterId: Cluster['id']): Promise<string> {
    let infraEnvId = InfraEnvIdsCacheService.getItem(clusterId);
    if (!infraEnvId) {
      const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
      if (infraEnvs.length !== 0) {
        const [infraEnv] = infraEnvs;
        InfraEnvIdsCacheService.setItem(clusterId, infraEnv.id);
        infraEnvId = infraEnv.id;
      } else {
        InfraEnvIdsCacheService.removeItem(clusterId);
        throw new Error(`No InfraEnv could be found for clusterId: ${clusterId}`);
      }
    }

    return infraEnvId;
  },

  async create(params: InfraEnvCreateParams) {
    if (!params.clusterId) {
      throw new Error('Cannot create InfraEnv, clusterId is missing');
    }

    const { data: infraEnv } = await InfraEnvsAPI.register(params);

    if (!infraEnv.id) {
      throw new Error('API returned no ID for the underlying InfraEnv');
    }

    InfraEnvIdsCacheService.setItem(params.clusterId, infraEnv.id);
  },

  async delete(clusterId: Cluster['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    InfraEnvIdsCacheService.removeItem(clusterId);
    return InfraEnvsAPI.deregister(infraEnvId);
  },
};

export default InfraEnvsService;
