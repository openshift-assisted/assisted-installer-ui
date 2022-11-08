import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type StorageClassK8sResource = {
  provisioner: string;
  reclaimPolicy: string;
  parameters?: {
    [key: string]: string;
  };
} & K8sResourceCommon;
