import { ImageCreateParams } from '../../api/types';

export type DiscoveryImageFormValues = ImageCreateParams & {
  enableProxy: boolean;
};
