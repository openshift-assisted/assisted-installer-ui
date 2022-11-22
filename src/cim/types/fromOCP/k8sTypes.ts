import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type SecretK8sResource = {
  data?: { [key: string]: string };
  stringData?: { [key: string]: string };
  type?: string;
} & K8sResourceCommon;

export type ConfigMapK8sResource = {
  data?: { [key: string]: string };
} & K8sResourceCommon;
