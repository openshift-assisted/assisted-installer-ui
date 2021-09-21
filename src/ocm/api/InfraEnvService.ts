import { AxiosPromise } from 'axios';
import {
  InfraEnv,
  InfraEnvCreateParams,
  InfraEnvList,
  InfraEnvUpdateParams,
} from '../../common/api/types';
import { client } from './axiosClient';

export const registerInfraEnv = (params: InfraEnvCreateParams): AxiosPromise<InfraEnv> =>
  client.post('/v2/infra-envs', params);

export const deregisterInfraEnv = (infraEnvId: string): AxiosPromise<void> =>
  client.delete(`/v2/infra-envs/${infraEnvId}`);

export const listInfraEnvs = (): AxiosPromise<InfraEnvList> => client.get('/v2/infra-envs/');

export const getInfraEnv = (infraEnvId: string): AxiosPromise<InfraEnv> =>
  client.get(`/v2/infra-envs/${infraEnvId}`);

export const patchInfraEnv = (
  infraEnvId: string,
  params: InfraEnvUpdateParams,
): AxiosPromise<InfraEnv> => client.patch(`/v2/infra-envs/${infraEnvId}`, params);

export const deleteInfraHost = (infraEnvId: string, hostId: string): AxiosPromise<void> =>
  client.delete(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}`);
