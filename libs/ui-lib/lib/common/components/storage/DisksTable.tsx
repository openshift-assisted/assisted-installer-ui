import React from 'react';
import {
  TextContent,
  Text,
  TextVariants,
  Popover,
  Alert,
  AlertVariant,
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  RowWrapperProps,
  RowWrapper,
  IRow,
} from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import type { Disk, Host } from '@openshift-assisted/types/assisted-installer-service';
import type { WithTestID } from '../../types/index';
import DiskRole, { OnDiskRoleType } from '../hosts/DiskRole';
import DiskLimitations from '../hosts/DiskLimitations';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import FormatDiskCheckbox, {
  DiskFormattingType,
  isInDiskSkipFormattingList,
} from '../hosts/FormatDiskCheckbox';
import { fileSize } from '../../utils';
import { PopoverIcon } from '../ui';
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

const diskColumns = (t: TFunction, showFormat: boolean) => [
  { title: 'Name' },
  { title: 'Role' },
  { title: 'Limitations' },
  showFormat ? { title: 'Format?' } : '',
  { title: 'Drive type' },
  { title: 'Size' },
  { title: 'Serial' },
  { title: 'Model' },
  {
    title: (
      <>
        WWN <PopoverIcon bodyContent={t('ai:World Wide Name (WWN) is a unique disk identifier.')} />
      </>
    ),
  },
];

const diskRowKey = ({ rowData }: ExtraParamsType) => rowData?.key as string;

const DisksTableRowWrapper = (props: RowWrapperProps) => (
  <RowWrapper {...props} data-testid={`disk-row-${(props.row?.key as string) || ''}`} />
);

const SkipFormattingDisk = () => (
  <TextContent>
    <Text component={TextVariants.p}>This bootable disk will skip formatting</Text>
  </TextContent>
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
          <ExclamationTriangleIcon color={warningColor.value} size="sm" />
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
            <ExclamationTriangleIcon color={warningColor.value} size="sm" />
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

  const rows: IRow[] = disks
    .filter((disk) => disk.driveType !== 'LVM')
    .sort((a, b) => (a.name && a.name.localeCompare(b.name as string)) || 0)
    .sort((a, b) => {
      const aVal = (a.holders || a.name) as string;
      const bVal = (b.holders || b.name) as string;

      return aVal?.localeCompare(bVal) || 0;
    })
    .map((disk, index) => ({
      cells: [
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
        isEditable && {
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
        },
        { title: disk.driveType, props: { 'data-testid': 'drive-type' } },
        { title: fileSize(disk.sizeBytes || 0, 2, 'si'), props: { 'data-testid': 'disk-size' } },
        { title: disk.serial, props: { 'data-testid': 'disk-serial' } },
        { title: disk.model, props: { 'data-testid': 'disk-model' } },
        { title: disk.wwn, props: { 'data-testid': 'disk-wwn' } },
      ],
      key: disk.path,
    }));

  return (
    <Table
      data-testid={testId}
      rows={rows}
      cells={diskColumnTitles}
      variant={TableVariant.compact}
      aria-label="Host's disks table"
      borders={false}
      rowWrapper={DisksTableRowWrapper}
    >
      <TableHeader />
      <TableBody rowKey={diskRowKey} />
    </Table>
  );
};

export { DisksTable, getDiskLimitation };
