import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type ClusterImageSetK8sResource = K8sResourceCommon & {
  spec?: { releaseImage: string };
};
