import { Disk, Host } from '@openshift-assisted/types/assisted-installer-service';

export type DiskFormattingType = (
  shouldFormatDisk: boolean,
  hostId: Host['id'],
  diskId: Disk['id'],
) => void;
