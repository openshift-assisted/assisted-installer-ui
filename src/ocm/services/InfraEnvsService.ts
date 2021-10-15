import { InfraEnvCreateParams, Cluster } from '../../common';
import { InfraEnvsAPI, ClustersAPI } from '../services/apis';
import InfraEnvIdsCacheService from './InfraEnvIdsCacheService';

const InfraEnvsService = {
  async getInfraEnvId(clusterId: Cluster['id']): Promise<string> {
    let infraEnvId = InfraEnvIdsCacheService.getItem(clusterId);
    if (!infraEnvId) {
      await InfraEnvsService.resetCache();
      infraEnvId = InfraEnvIdsCacheService.getItem(clusterId);

      if (!infraEnvId) {
        throw Error(`No InfraEnv could be found for clusterId: ${clusterId}`);
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

  async fillCache() {
    const result = await Promise.all([ClustersAPI.list(), InfraEnvsAPI.list()]);
    const [responseFromClusterService, responseFromInfraEnvService] = result;

    const availableInfraEnvs = responseFromInfraEnvService.data?.filter(({ clusterId }) =>
      responseFromClusterService.data?.some(({ id }) => id === clusterId),
    );

    for (const { id: infraEnvId, clusterId } of availableInfraEnvs) {
      if (infraEnvId && clusterId) {
        InfraEnvIdsCacheService.setItem(clusterId, infraEnvId);
      }
    }
  },

  async resetCache() {
    InfraEnvIdsCacheService.clear();
    await InfraEnvsService.fillCache();
  },
};

export default InfraEnvsService;
