import { ImageCreateParams, Cluster } from '../../api/types';

export type ProxyFieldsType = {
  enableProxy: boolean;
  httpProxy: Cluster['httpProxy'];
  httpsProxy: Cluster['httpsProxy'];
  noProxy: Cluster['noProxy'];
};

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

export type BareMetalInventoryVariant = 'Cluster' | 'AddHostsCluster'; // conforms Cluster['kind'] but let's keep these two detechaed
