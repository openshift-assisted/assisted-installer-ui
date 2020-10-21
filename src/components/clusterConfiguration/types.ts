import { ImageCreateParams, Cluster } from '../../api/types';

export type ProxyFieldsType = {
  enableProxy: boolean;
  httpProxy: Cluster['httpProxy'];
  httpsProxy: Cluster['httpsProxy'];
  noProxy: Cluster['noProxy'];
};

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;
