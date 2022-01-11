import { DiskEncryption } from '../../api';

export type ClusterDetailsValues = {
  name: string;
  highAvailabilityMode: 'Full' | 'None';
  openshiftVersion: string;
  pullSecret: string;
  baseDnsDomain: string;
  SNODisclaimer: boolean;
  useRedHatDnsService: boolean;
  enableDiskEncryptionOnMasters: boolean;
  enableDiskEncryptionOnWorkers: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  diskEncryptionTangServers: { url: string; thumbprint: string }[];
  diskEncryption?: DiskEncryption;
};
