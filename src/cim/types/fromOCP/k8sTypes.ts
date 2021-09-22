import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type SecretK8sResource = {
  data?: { [key: string]: string };
  stringData?: { [key: string]: string };
  type?: string;
} & K8sResourceCommon;

export type ConfigMapK8sResource = {
  data?: { [key: string]: string };
} & K8sResourceCommon;
