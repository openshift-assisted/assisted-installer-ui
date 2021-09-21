import { AxiosPromise } from 'axios';
import { client } from './axiosClient';
import { AddHostsClusterCreateParams, Cluster, Host, HostUpdateParams } from '../../common';

export const addHostsClusters = (params: AddHostsClusterCreateParams): AxiosPromise<Cluster> =>
  client.post('/v1/add_hosts_clusters', params);

export const installHosts = (clusterId: Cluster['id']): AxiosPromise<Cluster> =>
  client.post(`/v1/clusters/${clusterId}/actions/install_hosts`);

export const installHost = (clusterId: Cluster['id'], hostId: Host['id']): AxiosPromise<Host> =>
  client.post(`/v1/clusters/${clusterId}/hosts/${hostId}/actions/install`);

export const patchInfraHost = (
  infraEnvId: string,
  hostId: string,
  params: HostUpdateParams,
): AxiosPromise<Host> => client.patch(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}`, params);

export const deleteHost = (infraEnvId: string, hostId: string): AxiosPromise<void> =>
  client.delete(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}`);

export const bindHost = (infraEnvId: string, hostId: string): AxiosPromise<Host> =>
  client.post(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}/actions/bind`);

export const unbindHost = (infraEnvId: string, hostId: string): AxiosPromise<Host> =>
  client.post(`/v2/infra-envs/${infraEnvId}/hosts/${hostId}/actions/unbind`);
