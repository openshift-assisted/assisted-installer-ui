import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { ListVersions, OpenshiftVersions } from './types';

export const getVersions = (): AxiosPromise<ListVersions> => client.get('/component_versions');

export const getOpenshiftVersions = (): AxiosPromise<OpenshiftVersions> =>
  client.get('/openshift_versions');
