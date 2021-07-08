import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type SecretKind = {
  data?: { [key: string]: string };
  stringData?: { [key: string]: string };
  type?: string;
} & K8sResourceCommon;
