import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { ManagedDomain } from './types';

export const getManagedDomains = (): AxiosPromise<ManagedDomain[]> => client.get('/domains');
