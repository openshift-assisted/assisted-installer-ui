import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type NMStateK8sResource = K8sResourceCommon & {
  spec?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    interfaces: {
      macAddress: string;
      name: string;
    }[];
  };
};
