import type { AxiosPromise } from 'axios';
import type {
  InfraEnv,
  InfraEnvCreateParams,
  InfraEnvList,
  Cluster,
} from '../../../common/api/types';
import { client } from '../axiosClient';
import InfraEnvIdsCache from './InfraEnvIdsCache';
import ClusterService from './ClusterService';

const listInfraEnvs = (): AxiosPromise<InfraEnvList> => client.get('/v2/infra-envs/');

const getInfraEnvId = async (clusterId: Cluster['id']): Promise<InfraEnv['id']> => {
  let infraEnvId = InfraEnvIdsCache.getItem(clusterId);
  if (!infraEnvId) {
    InfraEnvIdsCache.clear();
    const responseFromInfraEnvService = await listInfraEnvs();
    const responseFromClusterService = await ClusterService.listClusters();
    responseFromInfraEnvService.data?.map((infraEnv) => [infraEnv.clusterId, infraEnv.id]);

    infraEnvId = '1234'; // call the api...
  }

  return infraEnvId;
};

const registerInfraEnv = (params: InfraEnvCreateParams): AxiosPromise<InfraEnv> =>
  client.post('/v2/infra-envs', params);

const deregisterInfraEnv = (infraEnvId: string): AxiosPromise<void> =>
  client.delete(`/v2/infra-envs/${infraEnvId}`);

// export const deleteInfraEnv = (clusterId: Cluster['id']) => {};

const InfraEnvService = {
  registerInfraEnv,
  // deleteInfraEnv,
  listInfraEnvs,
  getInfraEnvId,
};

export default InfraEnvService;
