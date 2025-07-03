import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type NMStateK8sResource = K8sResourceCommon & {
  spec?: {
    config: unknown;
    interfaces: {
      macAddress: string;
      name: string;
    }[];
  };
};
