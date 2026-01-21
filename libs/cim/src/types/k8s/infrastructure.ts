import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type PlatformType = 'AWS' | 'BareMetal'; // TODO(mlibra): List all supported platform types here

export type InfrastructureK8sResource = K8sResourceCommon & {
  spec?: {
    platformSpec?: {
      type: PlatformType;
    };
  };
  status?: {
    apiServerInternalURI?: string;
    apiServerURL?: string;
    controlPlaneTopology?: string; // i.e. HighlyAvailable
    etcdDiscoveryDomain?: string;
    infrastructureName?: string;
    infrastructureTopology?: string; // i.e. HighlyAvailable
    platform: PlatformType;
    platformStatus?: {
      type: PlatformType;
    };
  };
};
