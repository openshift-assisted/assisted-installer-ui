import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type IngressControllerK8sResource = K8sResourceCommon & {
  spec?: {
    domain?: string;
  };
};
