import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type BareMetalHostK8sResource = K8sResourceCommon & {
  spec?: {
    bmc?: {
      address: string;
      credentialsName: string;
      disableCertificateVerification: boolean;
    };
    bootMACAddress: string;
    consumerRef?: {
      apiVersion: string;
      kind: string;
      name: string;
      namespace: string;
    };
    image?: {
      checksum: string;
      url: string;
    };
    online: boolean;
    externallyProvisioned?: boolean;
    description?: string;
  };
  status?: {
    provisioning?: {
      state?: string;
    };
    errorMessage?: string;
    errorType?: string;
    operationalStatus?: 'OK' | 'discovered' | 'error' | 'delayed' | 'detached';
    operationHistory?: {
      register?: {
        start?: string;
        end?: string;
      };
      provision?: {
        start?: string;
        end?: string;
      };
      inspect?: {
        start?: string;
        end?: string;
      };
      deprovision?: {
        start?: string;
        end?: string;
      };
    };
    lastUpdated?: string;
  };
};
