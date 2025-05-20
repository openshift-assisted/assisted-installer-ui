import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type MCEK8sResource = K8sResourceCommon & {
  spec?: {
    targetNamespace?: string;
  };
};
