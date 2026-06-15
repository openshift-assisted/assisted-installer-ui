import * as React from 'react';
import { Popover, Content, ContentVariants, Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { Disk, Host } from '@openshift-assisted/types/assisted-installer-service';
import { getInventory } from '../hosts/utils';
import type { TableRow } from '../hosts/AITable';
import { trimCommaSeparatedList } from '../ui';

export const numberOfDisksColumn: TableRow<Host> = {
  header: {
    title: 'Number of disks',
    props: {
      id: 'col-header-num-disks',
    },
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const disks = inventory.disks || [];
    return {
      title: (
        <>
          {' '}
          {disks.length}
          {'   '}
          {host.skipFormattingDisks && (
            <Popover
              bodyContent={
                <Content component={ContentVariants.p}>
                  Some bootable disks will skip formatting
                </Content>
              }
              minWidth="20rem"
              maxWidth="30rem"
            >
              <Icon size="sm" status="warning">
                <ExclamationTriangleIcon />
              </Icon>
            </Popover>
          )}
        </>
      ),
      props: { 'data-testid': 'disk-number' },
      sortableValue: disks.length,
    };
  },
};

export const odfUsageColumn = (excludeMasters: boolean): TableRow<Host> => {
  return {
    header: {
      title: 'ODF Usage',
      props: {
        id: 'col-header-odf',
      },
      sort: true,
    },
    cell: (host) => {
      const isMaster = host.role === 'master' || host.suggestedRole === 'master';
      const isExcluded = excludeMasters && isMaster;
      return {
        title: isExcluded ? (
          <div
            style={{
              color: 'var(--pf-t--global--icon--color--disabled)',
            }}
          >
            Excluded for ODF
          </div>
        ) : (
          'Use ODF'
        ),
        props: { 'data-testid': 'use-odf' },
        sortableValue: Number(isExcluded),
      };
    },
  };
};

export const getDiskLimitation = (
  diskName: Disk['name'],
  hostName: Host['requestedHostname'],
  holder: Disk,
) => {
  if (holder.driveType) {
    switch (holder.driveType) {
      case 'LVM':
        return `LVM logical volumes were found on the installation disk ${
          diskName as string
        } selected for host ${hostName as string} and will be deleted during installation.`;
      case 'RAID':
        return `The installation disk ${diskName as string} selected for host ${
          hostName as string
        }, is part of a software RAID that will be deleted during the installation.`;
      case 'Multipath':
        return `The installation disk ${diskName as string} selected for host ${
          hostName as string
        } is managed by multipath. We strongly recommend using the multipath device ${
          holder.name as string
        } to improve reliability.`;
    }
  }
};

export const isInstallationDisk = (diskId?: string, installationDiskId?: string) =>
  diskId === installationDiskId;

export const isInDiskSkipFormattingList = (host: Host, diskId: string | undefined) => {
  return (
    trimCommaSeparatedList(host.skipFormattingDisks ? host.skipFormattingDisks : '')
      .split(',')
      .filter((diskSkipFormatting) => diskSkipFormatting === diskId).length > 0
  );
};

export const isInDiskToBeFormattedList = (host: Host, diskId: string | undefined) => {
  return (
    trimCommaSeparatedList(host.disksToBeFormatted ? host.disksToBeFormatted : '')
      .split(',')
      .filter((diskToBeFormatted) => diskToBeFormatted === diskId).length > 0
  );
};

export const isInvalidInstallationDisk = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  // If it's an installation disk that somehow is set to skip formatting, enable the checkbox to let the user fix it
  if (isInstallationDisk(diskId, installationDiskId)) {
    return isInDiskSkipFormattingList(host, diskId);
  }
  return false;
};

export const isFormatDiskChecked = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  if (isInstallationDisk(diskId, installationDiskId)) {
    return !isInDiskSkipFormattingList(host, diskId);
  }
  return isInDiskToBeFormattedList(host, diskId) && !isInDiskSkipFormattingList(host, diskId);
};

export const isFormatDiskDisabled = (
  host: Host,
  diskId: string | undefined,
  installationDiskId: Host['installationDiskId'],
) => {
  if (isInstallationDisk(diskId, installationDiskId)) {
    // If it's an installation disk that somehow is set to skip formatting, enable the checkbox to let the user fix it
    return !isInvalidInstallationDisk(host, diskId, installationDiskId);
  }
  return !isInDiskToBeFormattedList(host, diskId);
};
