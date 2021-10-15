import { Cluster } from '../../common';
import { AxiosError, AxiosPromise } from 'axios';
import InfraEnvsService from './InfraEnvsService';
import { HostsAPI } from '../services/apis';

const HostsService = {
  async deleteAll(clusterId: Cluster['id']) {
    try {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
      const response = await HostsAPI.list(infraEnvId);
      const hostIds = response.data?.map((host) => host.id);
      const promises: AxiosPromise<void>[] = [];

      for (const hostId of hostIds) {
        promises.push(HostsAPI.deregister(infraEnvId, hostId));
      }

      return Promise.all(promises);
    } catch (e) {
      throw e as AxiosError<Partial<{ reason: string; message: string }>>;
    }
  },
};

export default HostsService;
