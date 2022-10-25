import React from 'react';
import { Checkbox, Tooltip } from '@patternfly/react-core';
import { Disk, Host } from '../../api';
import { trimCommaSeparatedList } from '../..';

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

const isInvalidInstallationDisk = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  // If it's an installation disk that somehow is set to skip formatting, enable the checkbox to let the user fix it
  if (isInstallationDisk(diskId, installationDiskId)) {
    return isDiskSkipFormatting(host, diskId);
  }
  return false;
};

export const isDiskToBeFormatted = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  return (
    (isInstallationDisk(diskId, installationDiskId) || isDiskFormattable(host, diskId)) &&
    !isDiskSkipFormatting(host, diskId)
  );
};

export const isFormatDiskDisabled = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  // If it's an installation disk that somehow is set to skip formatting, enable the checkbox to let the user fix it
  if (isInvalidInstallationDisk(host, diskId, installationDiskId)) {
    return false;
  }
  return !isDiskFormattable(host, diskId);
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
