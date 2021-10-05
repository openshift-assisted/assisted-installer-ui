import type { Cluster, Host, HostList, InfraEnv } from '../../common/api';
import { AxiosError, AxiosPromise } from 'axios';
import { client } from '../api/axiosClient';
import InfraEnvService from './InfraEnvService';

const HostService = {
  list(infraEnvId: InfraEnv['id']): AxiosPromise<HostList> {
    return client.get(`/v2/infra-envs/${infraEnvId}/hosts`);
  },
  deregister(infraEnvId: InfraEnv['id'], hostId: Host['id']): AxiosPromise<void> {
    return client.delete(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}`);
  },
  async deleteAll(clusterId: Cluster['id']) {
    try {
      const infraEnvId = await InfraEnvService.getInfraEnvId(clusterId);
      const response = await HostService.list(infraEnvId);
      const hostIds = response.data?.map((host) => host.id);
      const promises: AxiosPromise<void>[] = [];

      for (const hostId of hostIds) {
        promises.push(HostService.deregister(infraEnvId, hostId));
      }

      return Promise.all(promises);
    } catch (e) {
      // noinspection UnnecessaryLocalVariableJS
      const error = e as AxiosError<Partial<{ reason: string; message: string }>>;
      throw error;
    }
  },
};

export default HostService;
