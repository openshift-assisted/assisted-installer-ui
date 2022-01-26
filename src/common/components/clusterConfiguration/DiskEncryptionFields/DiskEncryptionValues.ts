import { DiskEncryption } from '../../../api';

export interface DiskEncryptionValues {
  enableDiskEncryptionOnMasters: boolean;
  enableDiskEncryptionOnWorkers: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
}
