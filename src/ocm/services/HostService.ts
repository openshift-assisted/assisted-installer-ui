import { Cluster, Host, InfraEnv } from '../../common';
import { AxiosError, AxiosPromise } from 'axios';
import { client } from '../api';
import InfraEnvService from './InfraEnvService';

const HostService = {
  list(infraEnvId: InfraEnv['id']) {
    return client.get<Host[]>(`/v2/infra-envs/${infraEnvId}/hosts`);
  },
  deregister(infraEnvId: InfraEnv['id'], hostId: Host['id']) {
    return client.delete<void>(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}`);
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
      throw e as AxiosError<Partial<{ reason: string; message: string }>>;
    }
  },
};

export default HostService;
