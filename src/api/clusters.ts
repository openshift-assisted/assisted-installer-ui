import { AxiosPromise, AxiosRequestConfig } from 'axios';
import {
  Cluster,
  ClusterCreateParams,
  Host,
  ClusterUpdateParams,
  ImageCreateParams,
} from './types';
import client from './axiosClient';
import { API_ROOT } from '.';

export const getClusters = (): AxiosPromise<Cluster[]> => client.get(`${API_ROOT}/clusters`);

export const getCluster = (id: string): AxiosPromise<Cluster> =>
  client.get(`${API_ROOT}/clusters/${id}`);

export const postCluster = (params: ClusterCreateParams): AxiosPromise<Cluster> =>
  client.post(`${API_ROOT}/clusters`, params);

export const patchCluster = (id: string, params: ClusterUpdateParams): AxiosPromise<Cluster> =>
  client.patch(`${API_ROOT}/clusters/${id}`, params);

export const deleteCluster = (id: string): AxiosPromise<void> =>
  client.delete(`${API_ROOT}/clusters/${id}`);

export const getClusterHosts = (id: string): AxiosPromise<Host[]> =>
  client.get(`${API_ROOT}/clusters/${id}/hosts`);

export const enableClusterHost = (clusterId: string, hostId: string): AxiosPromise<void> =>
  client.post(`${API_ROOT}/clusters/${clusterId}/hosts/${hostId}/actions/enable`);

export const disableClusterHost = (clusterId: string, hostId: string): AxiosPromise<void> =>
  client.delete(`${API_ROOT}/clusters/${clusterId}/hosts/${hostId}/actions/enable`);

export const postInstallCluster = (clusterId: string): AxiosPromise<Cluster> =>
  client.post(`${API_ROOT}/clusters/${clusterId}/actions/install`);

type ImageCreateResponse = {
  imageId: string;
};
export const createClusterDownloadsImage = (
  id: string,
  params: ImageCreateParams,
  axiosOptions: AxiosRequestConfig,
): AxiosPromise<ImageCreateResponse> =>
  client.post<ImageCreateResponse>(
    `${API_ROOT}/clusters/${id}/downloads/image`,
    params,
    axiosOptions,
  );

export const getClusterDownloadsImageUrl = (clusterId: string, imageId: string) =>
  `${API_ROOT}/clusters/${clusterId}/downloads/image?image_id=${imageId}`;
