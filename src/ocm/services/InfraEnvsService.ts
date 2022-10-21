import { Cluster, CpuArchitecture, InfraEnvCreateParams } from '../../common';
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

  /**
   * This function can only be used to return the Cpu Architecture for a Day1 cluster.
   * It will check the infraEnvs for the cluster, and expect only 1 to exist
   * @param clusterId Day1 clusterId
   */
  async getClusterCpuArchitecture(clusterId: Cluster['id']): Promise<CpuArchitecture> {
    const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
    if (infraEnvs.length === 1) {
      const cpuArchitecture = infraEnvs[0].cpuArchitecture as CpuArchitecture;
      return cpuArchitecture || CpuArchitecture.x86;
    } else {
      throw new Error(
        `A Day1 cluster should have exactly 1 infraEnv, but ${infraEnvs.length} were found`,
      );
    }
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
};

export default InfraEnvsService;
