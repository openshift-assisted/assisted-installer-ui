import React from 'react';
import { TextContent, Text, TextVariants, Popover } from '@patternfly/react-core';
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
import { Disk, fileSize, Host, WithTestID } from '../../index';
import DiskRole, { OnDiskRoleType } from '../hosts/DiskRole';
import DiskLimitations from '../hosts/DiskLimitations';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import FormatDiskCheckbox, {
  DiskFormattingType,
  isInDiskSkipFormattingList,
} from '../hosts/FormatDiskCheckbox';

interface DisksTableProps extends WithTestID {
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: OnDiskRoleType;
  host: Host;
  disks: Disk[];
  installationDiskId?: string;
  updateDiskSkipFormatting?: DiskFormattingType;
}

const diskColumns = [
  { title: 'Name' },
  { title: 'Role' },
  { title: 'Limitations' },
  { title: 'Format?' },
  { title: 'Drive type' },
  { title: 'Size' },
  { title: 'Serial' },
  { title: 'Model' },
  { title: 'WWN' },
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

const DisksTable = ({
  canEditDisks,
  host,
  disks,
  installationDiskId,
  testId,
  onDiskRole,
  updateDiskSkipFormatting,
}: DisksTableProps) => {
  const isEditable = !!canEditDisks?.(host);

  const rows: IRow[] = [...disks]
    .sort((diskA, diskB) => diskA.name?.localeCompare(diskB.name || '') || 0)
    .map((disk, index) => ({
      cells: [
        {
          title: (
            <>
              {isInDiskSkipFormattingList(host, disk.id) && (
                <Popover bodyContent={<SkipFormattingDisk />} minWidth="20rem" maxWidth="30rem">
                  <ExclamationTriangleIcon color={warningColor.value} size="sm" />
                </Popover>
              )}
              {'   '}
              {disk.bootable ? `${disk.name || ''} (bootable)` : disk.name}
            </>
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
        {
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
      cells={diskColumns}
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

export default DisksTable;
