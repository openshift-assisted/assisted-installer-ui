import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { AddHostsClusterCreateParams, Cluster } from './types';

export const addHostsClusters = (params: AddHostsClusterCreateParams): AxiosPromise<Cluster> =>
  client.post('/add_hosts_clusters', params);

export const installHosts = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/clusters/${clusterId}/actions/install_hosts`);
