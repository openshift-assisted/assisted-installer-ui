import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { ListVersions, OpenshiftVersions } from '../../common';

export const getVersions = (): AxiosPromise<ListVersions> => client.get('/v1/component_versions');

export const getOpenshiftVersions = (): AxiosPromise<OpenshiftVersions> =>
  client.get('/v1/openshift_versions');
