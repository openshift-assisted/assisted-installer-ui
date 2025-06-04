import React from 'react';
import {
  Content,
  ContentVariants,
  Popover,
  Alert,
  AlertVariant,
} from '@patternfly/react-core';
import { TableVariant, Thead, Tbody, Table, Th, Tr, Td } from '@patternfly/react-table';
import type { Disk, Host } from '@openshift-assisted/types/assisted-installer-service';
import type { WithTestID } from '../../types/index';
import DiskRole, { OnDiskRoleType } from '../hosts/DiskRole';
import DiskLimitations from '../hosts/DiskLimitations';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import FormatDiskCheckbox, {
  DiskFormattingType,
  isInDiskSkipFormattingList,
} from '../hosts/FormatDiskCheckbox';
import { fileSize } from '../../utils';
import { PopoverIcon, UiIcon } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

interface DisksTableProps extends WithTestID {
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: OnDiskRoleType;
  host: Host;
  disks: Disk[];
  installationDiskId?: string;
  updateDiskSkipFormatting?: DiskFormattingType;
}

const diskColumns = (t: TFunction, showFormat: boolean) =>
  [
    { title: t('ai:Name') },
    { title: t('ai:Role') },
    { title: t('ai:Limitations') },
    showFormat ? { title: t('ai:Format?') } : '',
    { title: t('ai:Drive type') },
    { title: t('ai:Size') },
    { title: t('ai:Serial') },
    { title: t('ai:Model') },
    {
      title: (
        <>
          WWN{' '}
          <PopoverIcon bodyContent={t('ai:World Wide Name (WWN) is a unique disk identifier.')} />
        </>
      ),
    },
  ].filter(Boolean) as { title: string | React.ReactNode }[];

const SkipFormattingDisk = () => (
  <Content>
    <Content component={ContentVariants.p}>This bootable disk will skip formatting</Content>
  </Content>
);

const getDiskLimitation = (
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

const DiskName = ({
  disk,
  disks,
  host,
  installationDiskId,
}: {
  disk: Disk;
  disks: Disk[];
  host: Host;
  installationDiskId?: string;
}) => {
  const isIndented = disk.holders?.split(',').length === 1;
  let diskLimitations = null;

  if (disk.id === installationDiskId) {
    const parentDisk = disks.find((d) => disk.holders?.split(',').includes(d.name as string));
    if (parentDisk) {
      diskLimitations = getDiskLimitation(disk.name, host.requestedHostname, parentDisk);
    }
  }

  return (
    <>
      {isIndented && <span style={{ width: '1rem', display: 'inline-block' }} />}
      {isInDiskSkipFormattingList(host, disk.id) && (
        <Popover bodyContent={<SkipFormattingDisk />} minWidth="20rem" maxWidth="30rem">
          <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />
        </Popover>
      )}
      {'   '}
      {disk.bootable ? `${disk.name || ''} (bootable)` : disk.name}
      {diskLimitations && (
        <>
          {'    '}
          <Popover
            headerContent="Warning"
            bodyContent={<Alert variant={AlertVariant.warning} isInline title={diskLimitations} />}
            minWidth="20rem"
            maxWidth="30rem"
            data-testid="disk-limitations-popover"
          >
            <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />
          </Popover>
        </>
      )}
    </>
  );
};

const DisksTable = ({
  canEditDisks,
  host,
  disks,
  installationDiskId,
  testId,
  onDiskRole,
  updateDiskSkipFormatting,
}: DisksTableProps) => {
  const { t } = useTranslation();
  const isEditable = !!canEditDisks?.(host);
  const diskColumnTitles = diskColumns(t, isEditable);

  const rows = disks
    .filter((disk) => disk.driveType !== 'LVM')
    .sort((a, b) => (a.name && a.name.localeCompare(b.name as string)) || 0)
    .sort((a, b) => {
      const aVal = (a.holders || a.name) as string;
      const bVal = (b.holders || b.name) as string;
      return aVal?.localeCompare(bVal) || 0;
    })
    .map((disk, index) => {
      const rowCells = [
        {
          title: (
            <DiskName
              disk={disk}
              disks={disks}
              host={host}
              installationDiskId={installationDiskId}
            />
          ),
          props: { 'data-testid': 'disk-name' },
        },
        {
          title: (
            <DiskRole
              host={host}
              disk={disk}
              installationDiskId={installationDiskId}
              isEditable={isEditable}
              onDiskRole={onDiskRole}
            />
          ),
          props: { 'data-testid': 'disk-role' },
        },
        { title: <DiskLimitations disk={disk} />, props: { 'data-testid': 'disk-limitations' } },
        isEditable
          ? {
              title: (
                <FormatDiskCheckbox
                  host={host}
                  diskId={disk.id}
                  installationDiskId={installationDiskId}
                  index={index}
                  updateDiskSkipFormatting={updateDiskSkipFormatting}
                />
              ),
              props: { 'data-testid': 'disk-formatted' },
            }
          : null,
        { title: disk.driveType, props: { 'data-testid': 'drive-type' } },
        { title: fileSize(disk.sizeBytes || 0, 2, 'si'), props: { 'data-testid': 'disk-size' } },
        { title: disk.serial, props: { 'data-testid': 'disk-serial' } },
        { title: disk.model, props: { 'data-testid': 'disk-model' } },
        { title: disk.wwn, props: { 'data-testid': 'disk-wwn' } },
      ].filter(Boolean); // Remove null values to keep alignment

      return { key: disk.path, cells: rowCells } as {
        key: string;
        cells: { title: string | React.ReactNode; props: object }[];
      };
    });
  return (
    <Table data-testid={testId} variant={TableVariant.compact} aria-label="Host's disks table">
      <Thead>
        <Tr>
          {diskColumnTitles.map((col, i) => (
            <Th key={`col-${i}`}>{col.title}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, i) => (
          // eslint-disable-next-line no-console
          <Tr key={`disk-row-${row.key}`} data-testid={`disk-row-${row.key}-host-${host.id}`}>
            {row.cells.map((cell, j) => (
              <Td key={`cell-${i}-${j}`} {...cell.props}>
                {cell.title}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export { DisksTable, getDiskLimitation };
