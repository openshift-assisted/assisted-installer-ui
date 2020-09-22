import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { HostRequirements } from './types';

export const getHostRequirements = (): AxiosPromise<HostRequirements> =>
  client.get('/host_requirements');
