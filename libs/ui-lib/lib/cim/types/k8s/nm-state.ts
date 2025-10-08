import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type NMStateK8sResource = K8sResourceCommon & {
  spec?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: {
      interfaces?: {
        name?: string;
        type?: string;
        state?: string;
        vlan?: {
          'base-iface'?: string;
          id?: number;
        };
        ipv4?: {
          address?: { ip?: string; 'prefix-length'?: number }[];
        };
        ipv6?: {
          address?: { ip?: string; 'prefix-length'?: number }[];
        };
      }[];
      'dns-resolver'?: {
        config: {
          server?: string[];
        };
      };
      routes?: {
        config?: {
          destination?: string;
          'next-hop-address'?: string;
          'next-hop-interface'?: string;
        }[];
      };
    };
    interfaces: {
      macAddress: string;
      name: string;
    }[];
  };
};
