import { InfraEnv, InfraEnvCreateParams, Cluster } from '../../common';
import { client } from '../api';
import InfraEnvIdsCacheService from './InfraEnvIdsCacheService';
import ClusterService from './ClusterService';
import { AxiosResponse } from 'axios';

const InfraEnvService = {
  list() {
    return client.get<InfraEnv[]>('/v2/infra-envs/');
  },

  async getInfraEnvId(clusterId: Cluster['id']): Promise<string> {
    let infraEnvId = InfraEnvIdsCacheService.getItem(clusterId);
    if (!infraEnvId) {
      await InfraEnvService.resetCache();
      infraEnvId = InfraEnvIdsCacheService.getItem(clusterId);

      if (!infraEnvId) {
        throw Error(`No InfraEnv could be found for clusterId: ${clusterId}`);
      }
    }

    return infraEnvId;
  },

  register(params: InfraEnvCreateParams) {
    return client.post<InfraEnvCreateParams, AxiosResponse<InfraEnv>>('/v2/infra-envs', params);
  },

  deregister(infraEnvId: InfraEnv['id']) {
    return client.delete<void>(`/v2/infra-envs/${infraEnvId}`);
  },

  async delete(clusterId: Cluster['id']) {
    const infraEnvId = await InfraEnvService.getInfraEnvId(clusterId);
    return InfraEnvService.deregister(infraEnvId);
  },

  async fillCache() {
    const result = await Promise.all([ClusterService.list(), InfraEnvService.list()]);
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
    await InfraEnvService.fillCache();
  },
};

export default InfraEnvService;
