import { AxiosPromise } from 'axios';
import { client } from './axiosClient';

export const getVersions = (): AxiosPromise => client.get('/versions');
