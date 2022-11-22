import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ClusterImageSetK8sResource = K8sResourceCommon & {
  spec?: { releaseImage: string };
};
