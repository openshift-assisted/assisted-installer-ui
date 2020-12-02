import { ImageCreateParams, Cluster } from '../../api/types';

export type ProxyFieldsType = {
  enableProxy: boolean;
  httpProxy: Cluster['httpProxy'];
  httpsProxy: Cluster['httpsProxy'];
  noProxy: Cluster['noProxy'];
};

export type ClusterNetworkDefaultSettings = {
  clusterNetworkCidr: string;
  serviceNetworkCidr: string;
  clusterNetworkHostPrefix: number;
};

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;
