import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type KlusterletAddonConfigK8sResource = K8sResourceCommon & {
  spec: {
    clusterName: string;
    clusterNamespace: string;
  };
};
