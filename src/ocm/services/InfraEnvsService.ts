import { Cluster, CpuArchitecture, InfraEnvCreateParams, InfraEnvUpdateParams } from '../../common';
import { InfraEnvsAPI } from './apis';
import InfraEnvIdsCacheService from './InfraEnvIdsCacheService';

const InfraEnvsService = {
  async getInfraEnvId(clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture): Promise<string> {
    let infraEnvId = InfraEnvIdsCacheService.getInfraEnvId(clusterId, cpuArchitecture);
    if (infraEnvId === null) {
      const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
      if (infraEnvs.length > 0) {
        InfraEnvIdsCacheService.updateInfraEnvs(clusterId, infraEnvs);
        infraEnvId = InfraEnvIdsCacheService.getInfraEnvId(clusterId, cpuArchitecture);
      }
      if (!infraEnvId) {
        InfraEnvIdsCacheService.removeInfraEnvId(clusterId, cpuArchitecture);
        throw new Error(
          `No InfraEnv could be found for clusterId: ${clusterId} and architecture ${
            cpuArchitecture || ''
          }`,
        );
      }
    }
    return infraEnvId;
  },

  async getInfraEnv(clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture) {
    const infraEnvId = InfraEnvIdsCacheService.getInfraEnvId(clusterId, cpuArchitecture);
    if (infraEnvId) {
      return InfraEnvsAPI.get(infraEnvId);
    } else {
      throw new Error(
        `No InfraEnv could be found for clusterId: ${clusterId} and architecture ${
          cpuArchitecture || ''
        }`,
      );
    }
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

    InfraEnvIdsCacheService.updateInfraEnvs(params.clusterId, [infraEnv]);
  },

  async removeAll(clusterId: Cluster['id']) {
    const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);

    const promises = infraEnvs.map((infraEnv) => {
      return InfraEnvsAPI.deregister(infraEnv.id);
    });

    InfraEnvIdsCacheService.removeInfraEnvId(clusterId, CpuArchitecture.USE_DAY1_ARCHITECTURE);

    return Promise.all(promises);
  },

  async updateAll(clusterId: Cluster['id'], params: InfraEnvUpdateParams) {
    const infraEnvIds = await InfraEnvsService.getAllInfraEnvIds(clusterId);
    const promises = infraEnvIds.map((id) => InfraEnvsAPI.update(id, params));
    return Promise.all(promises);
  },
};

export default InfraEnvsService;
