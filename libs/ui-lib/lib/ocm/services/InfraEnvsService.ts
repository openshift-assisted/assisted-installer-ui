import { AxiosResponse } from 'axios';
import { CpuArchitecture } from '../../common';
import { InfraEnvsAPI } from './apis';
import InfraEnvCache from './InfraEnvIdsCacheService';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';
import { isAxiosError } from '../../common/api/axiosExtensions';
import {
  Cluster,
  HostStaticNetworkConfig,
  InfraEnv,
  InfraEnvCreateParams,
} from '@openshift-assisted/types/assisted-installer-service';

const InfraEnvsService = {
  async getInfraEnvId(
    clusterId: Cluster['id'],
    cpuArchitecture: CpuArchitecture,
    isSingleClusterFeatureEnabled?: boolean,
  ): Promise<string | Error> {
    let infraEnvId = InfraEnvCache.getInfraEnvId(clusterId, cpuArchitecture);
    if (infraEnvId instanceof Error) {
      const { data: infraEnvs } = await InfraEnvsAPI.list(
        !isSingleClusterFeatureEnabled ? clusterId : '',
      );
      if (infraEnvs.length > 0) {
        InfraEnvCache.updateInfraEnvs(clusterId, infraEnvs);
        infraEnvId = InfraEnvCache.getInfraEnvId(clusterId, cpuArchitecture);
      }
      if (!infraEnvId) {
        InfraEnvCache.removeInfraEnvId(clusterId, cpuArchitecture);
      }
    }
    return infraEnvId;
  },

  async getInfraEnv(clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId, cpuArchitecture);
    if (infraEnvId && !(infraEnvId instanceof Error)) {
      const { data } = await InfraEnvsAPI.get(infraEnvId);
      return data;
    } else {
      return new Error(`Failed to retrieve the infraEnv for ${clusterId}`);
    }
  },

  async getAllInfraEnvIds(clusterId: Cluster['id']): Promise<string[]> {
    const infraEnvs = await InfraEnvsService.getAllInfraEnvs(clusterId);
    return infraEnvs.map((infraEnv) => infraEnv.id);
  },

  async getAllInfraEnvs(clusterId: Cluster['id']): Promise<InfraEnv[]> {
    const { data: infraEnvs } = await InfraEnvsAPI.list(clusterId);
    return infraEnvs;
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
    return infraEnv;
  },

  async getOrCreate(
    params: InfraEnvCreateParams,
    isSingleClusterFeatureEnabled?: boolean,
  ): Promise<InfraEnv> {
    if (!params.clusterId) {
      throw new Error('Cannot create InfraEnv, clusterId is missing');
    }

    if (!params.cpuArchitecture) {
      throw new Error('Cannot get or create InfraEnv, cpuArchitecture is missing');
    }

    // Check if an InfraEnv already exists
    try {
      const existingInfraEnvId = await InfraEnvsService.getInfraEnvId(
        params.clusterId,
        params.cpuArchitecture as CpuArchitecture,
        isSingleClusterFeatureEnabled,
      );

      if (existingInfraEnvId && !(existingInfraEnvId instanceof Error)) {
        // InfraEnv exists, fetch and return it
        const { data: infraEnv } = await InfraEnvsAPI.get(existingInfraEnvId);
        // Update cache to maintain consistency
        InfraEnvCache.updateInfraEnvs(params.clusterId, [infraEnv]);
        return infraEnv;
      }
    } catch (error) {
      // Only suppress 404 (not found) errors - let other errors propagate
      if (isAxiosError(error) && error.response?.status === 404) {
        // Fall through to create a new InfraEnv
      } else {
        // Re-throw authentication, network, and other unexpected errors
        throw error;
      }
    }

    // No InfraEnv exists, create one
    return InfraEnvsService.create(params);
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

  makeInfraEnvName(cpuArchitecture: string, name?: string) {
    return `${name || ''}_infra-env-${cpuArchitecture}`;
  },
};

export default InfraEnvsService;
