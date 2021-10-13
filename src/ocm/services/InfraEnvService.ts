import { AxiosPromise, AxiosResponse } from 'axios';
import { InfraEnv, InfraEnvCreateParams, InfraEnvList, Cluster } from '../../common/api/types';
import { client } from '../api/axiosClient';
import InfraEnvIdsCacheService from './InfraEnvIdsCacheService';
import ClusterService from './ClusterService';

const InfraEnvService = {
  list(): AxiosPromise<InfraEnvList> {
    return client.get('/v2/infra-envs/');
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

  register(params: InfraEnvCreateParams): AxiosPromise<InfraEnv> {
    return client.post('/v2/infra-envs', params);
  },

  deregister(infraEnvId: InfraEnv['id']): AxiosPromise<void> {
    return client.delete(`/v2/infra-envs/${infraEnvId}`);
  },

  async delete(clusterId: Cluster['id']): Promise<AxiosResponse<void>> {
    const infraEnvId = await InfraEnvService.getInfraEnvId(clusterId);
    return InfraEnvService.deregister(infraEnvId);
  },

  async fillCache(): Promise<void> {
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
