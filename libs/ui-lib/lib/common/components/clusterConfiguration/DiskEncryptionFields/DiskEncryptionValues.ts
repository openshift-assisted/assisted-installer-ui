import { DiskEncryption } from '@openshift-assisted/types/assisted-installer-service';

export type TangServer = {
  url: string;
  thumbprint: string;
};

export interface DiskEncryptionValues {
  enableDiskEncryptionOnMasters?: boolean;
  enableDiskEncryptionOnWorkers: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  diskEncryptionTangServers: TangServer[];
}
