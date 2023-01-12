import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type BareMetalHostCPU = {
  arch: string;
  clockMegahertz: number;
  count: number;
  flags: string[];
  model: string;
};

export type BareMetalHostBios = {
  date: string;
  vendor: string;
  version: string;
};

export type BareMetalHostNIC = {
  ip: string;
  mac: string;
  model: string;
  name: string;
  pxe: boolean;
  speedGbps: number;
  vlanId: number;
};

export type BareMetalHostDisk = {
  hctl: string;
  model: string;
  name: string;
  rotational: boolean;
  serialNumber: string;
  sizeBytes: number;
  vendor: string;
};

export type BareMetalHostSystemVendor = {
  manufacturer: string;
  productName: string;
  serialNumber: string;
};

export type BareMetalHostKind = {
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
    automatedCleaningMode: string;
    externallyProvisioned?: boolean;
    description?: string;
  };
  status?: {
    hardwareProfile: string;
    poweredOn: boolean;
    operationalStatus: string;
    hardware?: {
      cpu?: BareMetalHostCPU;
      firmware?: {
        bios: BareMetalHostBios;
      };
      hostname: string;
      nics?: BareMetalHostNIC[];
      ramMebibytes: number;
      storage: BareMetalHostDisk[];
      systemVendor: BareMetalHostSystemVendor;
    };
    provisioning?: {
      ID: string;
      image?: {
        checksum: string;
        url: string;
      };
      state: string;
    };
    errorType?: string;
    errorMessage: string;
  };
} & K8sResourceCommon;
