import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type StorageClassK8sResource = {
  provisioner: string;
  reclaimPolicy: string;
  parameters?: {
    [key: string]: string;
  };
} & K8sResourceCommon;
