import { AxiosResponse } from 'axios';
import {
  Cluster,
  CpuArchitecture,
  HostStaticNetworkConfig,
  InfraEnv,
  InfraEnvCreateParams,
} from '../../common';
import { InfraEnvsAPI } from './apis';
import InfraEnvCache from './InfraEnvIdsCacheService';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';

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
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId, cpuArchitecture);
    if (infraEnvId) {
      const { data } = await InfraEnvsAPI.get(infraEnvId);
      return data;
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

    InfraEnvCache.removeInfraEnvs(clusterId);

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

  async setDummyStaticConfigToInfraEnv(infraEnvId: InfraEnv['id']): Promise<InfraEnv> {
    const { data } = await InfraEnvsAPI.update(infraEnvId, {
      staticNetworkConfig: getDummyInfraEnvField(),
    });
    return data;
  },

  async syncStaticIpConfigs(
    clusterId: Cluster['id'],
    currentInfraEnvId: InfraEnv['id'],
    staticNetworkConfig: HostStaticNetworkConfig[],
  ): Promise<InfraEnv> {
    // Updates staticIpConfigs on "currentInfraEnvId", and then it
    const { data: updatedInfraEnv } = await InfraEnvsAPI.update(currentInfraEnvId, {
      staticNetworkConfig,
    });

    const updateRequests: Promise<AxiosResponse<InfraEnv, unknown>>[] = [];
    const infraEnvIds = await InfraEnvsService.getAllInfraEnvIds(clusterId);
    infraEnvIds.forEach((infraEnvId) => {
      // Copies the same configuration to the other infraEnvs of the same cluster
      if (infraEnvId !== currentInfraEnvId) {
        updateRequests.push(
          InfraEnvsAPI.update(infraEnvId, {
            staticNetworkConfig,
          }),
        );
      }
    });

    // TODO (multi-arch) what should happen if one of the infraEnvs fails to get the same configuration
    return Promise.all(updateRequests).then(() => {
      return updatedInfraEnv;
    });
  },
};

export default InfraEnvsService;
