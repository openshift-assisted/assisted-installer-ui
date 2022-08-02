import React from 'react';
import { TextContent, Text, TextVariants, Grid, GridItem } from '@patternfly/react-core';
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
import { Disk, fileSize, getInventory, Host, WithTestID } from '../../index';
import DiskRole, { onDiskRoleType } from '../hosts/DiskRole';
import DiskLimitations from '../hosts/DiskLimitations';

type StorageDetailProps = {
  host: Host;
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: onDiskRoleType;
};

interface SectionTitleProps extends WithTestID {
  title: string;
}

interface DisksTableProps extends WithTestID {
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: onDiskRoleType;
  host: Host;
  disks: Disk[];
  installationDiskId?: string;
}

const SectionTitle = ({ title, testId }: SectionTitleProps) => (
  <GridItem>
    <TextContent>
      <Text data-testid={testId} component={TextVariants.h3}>
        {title}
      </Text>
    </TextContent>
  </GridItem>
);

const diskColumns = [
  { title: 'Name' },
  { title: 'Role' },
  { title: 'Limitations' },
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

const DisksTable = ({
  canEditDisks,
  host,
  disks,
  installationDiskId,
  testId,
  onDiskRole,
}: DisksTableProps) => {
  const isEditable = !!canEditDisks?.(host);
  const rows: IRow[] = [...disks]
    .sort((diskA, diskB) => diskA.name?.localeCompare(diskB.name || '') || 0)
    .map((disk) => ({
      cells: [
        {
          title: disk.bootable ? `${disk.name || ''} (bootable)` : disk.name,
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

const StorageDetail = ({ host, canEditDisks, onDiskRole }: StorageDetailProps) => {
  const inventory = getInventory(host);
  const disks = inventory.disks || [];

  return (
    <Grid hasGutter>
      <SectionTitle
        testId={'disks-section'}
        title={`${disks.length} Disk${disks.length === 1 ? '' : 's'}`}
      />
      <GridItem>
        <DisksTable
          testId={'disks-table'}
          canEditDisks={canEditDisks}
          host={host}
          disks={disks}
          installationDiskId={host.installationDiskId}
          onDiskRole={onDiskRole}
        />
      </GridItem>
    </Grid>
  );
};

export default StorageDetail;
