import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type SecretKind = {
  data?: { [key: string]: string };
  stringData?: { [key: string]: string };
  type?: string;
} & K8sResourceCommon;
