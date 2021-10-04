import type { Host, HostList, InfraEnv } from '../../../common/api';
import { AxiosError, AxiosPromise } from 'axios';
import { client } from '../axiosClient';

const listHosts = (infraEnvId: InfraEnv['id']): AxiosPromise<HostList> =>
  client.get(`/v2/infra-envs/${infraEnvId}/hosts`);

const deregisterHost = (infraEnvId: InfraEnv['id'], hostId: Host['id']): AxiosPromise<void> =>
  client.delete(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}`);

const deleteAllHosts = async (infraEnvId: InfraEnv['id']) => {
  try {
    const response = await listHosts(infraEnvId);
    const hostIds = response.data?.map((host) => host.id);
    const promises: AxiosPromise<void>[] = [];

    for (const hostId of hostIds) {
      promises.push(deregisterHost(infraEnvId, hostId));
    }

    return Promise.all(promises);
  } catch (e) {
    // noinspection UnnecessaryLocalVariableJS
    const error: AxiosError<Partial<{ reason: string; message: string }>> = e;
    throw error;
  }
};

const HostsService = {
  listHosts,
  deregisterHost,
  deleteAllHosts,
};

export default HostsService;
