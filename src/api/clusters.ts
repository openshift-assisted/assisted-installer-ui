import { AxiosPromise, AxiosRequestConfig } from 'axios';
import {
  Cluster,
  ClusterCreateParams,
  Host,
  ClusterUpdateParams,
  ImageCreateParams,
  Credentials,
} from './types';
import { client } from './axiosClient';

export const getClusters = (): AxiosPromise<Cluster[]> => client.get('/clusters');

export const getCluster = (id: string): AxiosPromise<Cluster> => client.get(`/clusters/${id}`);

export const postCluster = (params: ClusterCreateParams): AxiosPromise<Cluster> =>
  client.post('/clusters', params);

export const patchCluster = (id: string, params: ClusterUpdateParams): AxiosPromise<Cluster> =>
  client.patch(`/clusters/${id}`, params);

export const deleteCluster = (id: string): AxiosPromise<void> => client.delete(`/clusters/${id}`);

export const getClusterHosts = (id: string): AxiosPromise<Host[]> =>
  client.get(`/clusters/${id}/hosts`);

export const enableClusterHost = (clusterId: string, hostId: string): AxiosPromise<Host> =>
  client.post(`/clusters/${clusterId}/hosts/${hostId}/actions/enable`);

export const disableClusterHost = (clusterId: string, hostId: string): AxiosPromise<Host> =>
  client.delete(`/clusters/${clusterId}/hosts/${hostId}/actions/enable`);

export const deleteClusterHost = (clusterId: string, hostId: string): AxiosPromise<void> =>
  client.delete(`/clusters/${clusterId}/hosts/${hostId}`);

export const postInstallCluster = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/clusters/${clusterId}/actions/install`);

export const postResetCluster = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/clusters/${clusterId}/actions/reset`);

export const postCancelInstallation = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`/clusters/${clusterId}/actions/cancel`);

export const createClusterDownloadsImage = (
  id: string,
  params: ImageCreateParams,
  axiosOptions: AxiosRequestConfig,
): AxiosPromise<Cluster> => client.post(`/clusters/${id}/downloads/image`, params, axiosOptions);

type Config = {
  url: string;
  headers: {
    [key: string]: string;
  };
};

const applyInterceptors = async (url: string) => {
  let cfg: Config = { url, headers: {} };
  const interceptors: ((cfg: Config) => Promise<Config>)[] = [];
  // eslint-disable-next-line
  // @ts-ignore
  client.interceptors.request.forEach((i) => interceptors.push(i.fulfilled));

  interceptors.reverse();

  for (const i of interceptors) {
    cfg = await i(cfg);
  }
  return cfg.url;
};

export const getClusterDownloadsImageUrl = (clusterId: string) =>
  applyInterceptors(`/clusters/${clusterId}/downloads/image`);

export const getClusterFileURL = (clusterID: string, fileName: string) =>
  applyInterceptors(`/clusters/${clusterID}/downloads/files?file_name=${fileName}`);

export const getClusterKubeconfigURL = (clusterID: string) =>
  applyInterceptors(`/clusters/${clusterID}/downloads/kubeconfig`);

export const getClusterCredentials = (clusterID: string): AxiosPromise<Credentials> =>
  client.get(`/clusters/${clusterID}/credentials`);
