import { DiskEncryption } from '../../../api';

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
