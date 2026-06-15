import React from 'react';
import { Checkbox, Tooltip } from '@patternfly/react-core';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { DiskFormattingType } from './types';
import { isFormatDiskChecked, isFormatDiskDisabled } from './utils';

type FormatDiskProps = {
  host: Host;
  index: number;
  updateDiskSkipFormatting?: DiskFormattingType;
  diskId?: string;
  installationDiskId?: string;
};

const onSelectFormattingDisk = (
  shouldFormatDisk: boolean,
  hostId: string,
  diskId?: string,
  updateDiskSkipFormatting?: DiskFormattingType,
) => {
  updateDiskSkipFormatting ? updateDiskSkipFormatting(shouldFormatDisk, hostId, diskId) : '';
};

export const FormatDiskCheckbox = ({
  host,
  diskId,
  installationDiskId,
  index,
  updateDiskSkipFormatting,
}: FormatDiskProps) => {
  return (
    <Tooltip
      hidden={!isFormatDiskDisabled(host, diskId, installationDiskId)}
      content={
        isFormatDiskChecked(host, diskId, installationDiskId)
          ? 'Installation disks are always being formatted.'
          : 'This disk is not bootable and will not be formatted.'
      }
    >
      <Checkbox
        id={`select-formatted-${host.id}-${index}`}
        isChecked={isFormatDiskChecked(host, diskId, installationDiskId)}
        isDisabled={isFormatDiskDisabled(host, diskId, installationDiskId)}
        onChange={(_event, checked: boolean) =>
          onSelectFormattingDisk(checked, host.id, diskId, updateDiskSkipFormatting)
        }
      />
    </Tooltip>
  );
};
