import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { ListVersions, OpenshiftVersions } from '../../common';

export const getVersions = (): AxiosPromise<ListVersions> => client.get('/v2/component_versions');

export const getOpenshiftVersions = (): AxiosPromise<OpenshiftVersions> =>
  client.get('/v2/openshift_versions');
