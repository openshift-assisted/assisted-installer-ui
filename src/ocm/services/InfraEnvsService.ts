import {
  Cluster,
  CpuArchitecture,
  HostStaticNetworkConfig,
  InfraEnvCreateParams,
} from '../../common';
import { InfraEnvsAPI } from './apis';
import InfraEnvCache from './InfraEnvIdsCacheService';
import { HostsNetworkConfigurationType } from './types';

const InfraEnvsService = {
  async getInfraEnvId(clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture): Promise<string> {
    let infraEnvId = InfraEnvCache.getInfraEnvId(clusterId, cpuArchitecture);
    if (infraEnvId === null) {
      const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
      if (infraEnvs.length > 0) {
        InfraEnvCache.updateInfraEnvs(clusterId, infraEnvs);
        infraEnvId = InfraEnvCache.getInfraEnvId(clusterId, cpuArchitecture);
      }
      if (!infraEnvId) {
        InfraEnvCache.removeInfraEnvId(clusterId, cpuArchitecture);
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
    const infraEnvId = InfraEnvCache.getInfraEnvId(clusterId, cpuArchitecture);
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

    InfraEnvCache.updateInfraEnvs(params.clusterId, [infraEnv]);
  },

  async removeAll(clusterId: Cluster['id']) {
    const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);

    const promises = infraEnvs.map((infraEnv) => {
      return InfraEnvsAPI.deregister(infraEnv.id);
    });

    InfraEnvCache.removeInfraEnvId(clusterId, CpuArchitecture.USE_DAY1_ARCHITECTURE);

    return Promise.all(promises);
  },

  async updateAllInfraEnvsToDhcp(clusterId: Cluster['id']) {
    const infraEnvIds = await InfraEnvsService.getAllInfraEnvIds(clusterId);
    const infraEnvUpdates = infraEnvIds.map((id) =>
      InfraEnvsAPI.update(id, {
        staticNetworkConfig: [],
      }),
    );
    return Promise.all(infraEnvUpdates);
  },

  async updateInfraEnvsToStaticIpConfig(
    clusterId: Cluster['id'],
    staticIpConfigs: HostStaticNetworkConfig[],
  ) {
    const infraEnvIds = await InfraEnvsService.getAllInfraEnvIds(clusterId);
    const infraEnvUpdates = infraEnvIds.map((id) =>
      InfraEnvsAPI.update(id, {
        staticNetworkConfig: staticIpConfigs,
      }),
    );
    return Promise.all(infraEnvUpdates);
  },
};

export default InfraEnvsService;
