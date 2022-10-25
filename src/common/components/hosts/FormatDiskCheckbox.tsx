import React from 'react';
import { Checkbox, Tooltip } from '@patternfly/react-core';
import { Disk, Host } from '../../api';
import { getInventory, OpticalDiskDriveType, trimCommaSeparatedList } from '../..';

export type DiskFormattingType = (
  shouldFormatDisk: boolean,
  hostId: Host['id'],
  diskId: Disk['id'],
) => void;

type FormatDiskProps = {
  host: Host;
  index: number;
  updateDiskSkipFormatting?: DiskFormattingType;
  diskId?: string;
  installationDiskId?: string;
};

export const isInstallationDisk = (diskId?: string, installationDiskId?: string) =>
  diskId === installationDiskId;

export const isDiskSkipFormatting = (host: Host, diskId: string | undefined) => {
  return (
    trimCommaSeparatedList(host.skipFormattingDisks ? host.skipFormattingDisks : '')
      .split(',')
      .filter((diskSkipFormatting) => diskSkipFormatting === diskId).length > 0
  );
};
export const isDiskFormattable = (host: Host, diskId: string | undefined) => {
  return (
    trimCommaSeparatedList(host.disksToBeFormatted ? host.disksToBeFormatted : '')
      .split(',')
      .filter((diskToBeFormatted) => diskToBeFormatted === diskId).length > 0
  );
};

export const isDiskToBeFormatted = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  if (isInstallationDisk(diskId, installationDiskId)) {
    return true;
  }
  return isDiskFormattable(host, diskId) && !isDiskSkipFormatting(host, diskId);
};

export const isFormatDiskDisabled = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  const inventory = getInventory(host);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const disk = (inventory.disks || []).find((disk) => disk.id === diskId)!;
  const isInstallationDisk = disk.id === installationDiskId;
  const condition =
    disk.driveType === OpticalDiskDriveType || disk.driveType === 'Unknown' || isInstallationDisk;
  return condition;
};

const onSelectFormattingDisk = (
  shouldFormatDisk: boolean,
  hostId: string,
  diskId?: string,
  updateDiskSkipFormatting?: DiskFormattingType,
) => {
  updateDiskSkipFormatting ? updateDiskSkipFormatting(shouldFormatDisk, hostId, diskId) : '';
};

const FormatDiskCheckbox = ({
  host,
  diskId,
  installationDiskId,
  index,
  updateDiskSkipFormatting,
}: FormatDiskProps) => {
  return (
    <Tooltip
      hidden={!isInstallationDisk(diskId, installationDiskId)}
      content={'Installation disks are always being formatted'}
    >
      <Checkbox
        id={`select-formatted-${host.id}-${index}`}
        isChecked={isDiskToBeFormatted(host, diskId, installationDiskId)}
        onChange={(checked: boolean) =>
          onSelectFormattingDisk(checked, host.id, diskId, updateDiskSkipFormatting)
        }
        isDisabled={isFormatDiskDisabled(host, diskId, installationDiskId)}
      />
    </Tooltip>
  );
};
export default FormatDiskCheckbox;
