import { InfraEnvCreateParams, Cluster, InfraEnv } from '../../common';
import { InfraEnvsAPI } from './apis';
import InfraEnvIdsCacheService from './InfraEnvIdsCacheService';

const InfraEnvsService = {
  async getInfraEnvId(
    clusterId: Cluster['id'],
    test: boolean,
    cpuArchitecture: Cluster['cpuArchitecture'],
  ): Promise<string> {
    let infraEnvId = InfraEnvIdsCacheService.getItem(clusterId);
    if (!infraEnvId) {
      // TODO Fix
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

  async getAllInfraEnvIds(clusterId: Cluster['id']): Promise<string[]> {
    const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
    return infraEnvs.map((infraEnv) => infraEnv.id);
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

  removeAll(clusterId: Cluster['id'], infraEnvIds: InfraEnv['id'][]) {
    const promises = [];
    for (const infraEnvId of infraEnvIds) {
      promises.push(InfraEnvsAPI.deregister(infraEnvId));
    }
    InfraEnvIdsCacheService.removeItem(clusterId);

    return Promise.all(promises);
  },
};

export default InfraEnvsService;
