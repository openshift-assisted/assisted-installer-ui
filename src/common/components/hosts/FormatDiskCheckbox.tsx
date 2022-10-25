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

export const isDiskToBeFormatted = (host: Host, diskId: string | undefined) => {
  return isDiskFormattable(host, diskId) && !isDiskSkipFormatting(host, diskId);
};

export const isFormatDiskDisabled = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: string | undefined,
) => {
  return (
    !isDiskFormattable(host, diskId) ||
    (isInstallationDisk(diskId, installationDiskId) && !isDiskSkipFormatting(host, diskId))
  );
};

const onSelectFormattingDisk = (
  shouldFormatDisk: boolean,
  hostId: string,
  diskId?: string,
  updateDiskSkipFormatting?: DiskFormattingType,
) => {
  updateDiskSkipFormatting ? updateDiskSkipFormatting(shouldFormatDisk, hostId, diskId) : '';
};

const FormatDiskCheckbox: React.FC<FormatDiskProps> = ({
  host,
  diskId,
  installationDiskId,
  index,
  updateDiskSkipFormatting,
}) => {
  return (
    <Tooltip
      hidden={!isInstallationDisk(diskId, installationDiskId)}
      content={'Installation disks are always being formatted'}
    >
      <Checkbox
        id={`select-formatted-${host.id}-${index}`}
        isChecked={isDiskToBeFormatted(host, diskId)}
        onChange={(checked: boolean) =>
          onSelectFormattingDisk(checked, host.id, diskId, updateDiskSkipFormatting)
        }
        isDisabled={isFormatDiskDisabled(host, diskId, installationDiskId)}
      />
    </Tooltip>
  );
};
export default FormatDiskCheckbox;
