import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { ListVersions } from './types';

export const getVersions = (): AxiosPromise<ListVersions> => client.get('/component_versions');
