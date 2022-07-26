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
import {
  Disk,
  fileSize,
  getInventory,
  Host,
  ValidationInfoActionProps,
  WithTestID,
} from '../../../common';
import DiskRole, { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import DiskLimitations from '../../../common/components/hosts/DiskLimitations';

type StorageDetailProps = {
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: onDiskRoleType;
  host: Host;
  AdditionalNTPSourcesDialogToggleComponent?: ValidationInfoActionProps['AdditionalNTPSourcesDialogToggleComponent'];
  hideNTPStatus?: boolean;
};

type SectionTitleProps = {
  title: string;
};

type DisksTableProps = {
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: onDiskRoleType;
  host: Host;
  disks: Disk[];
  installationDiskId?: string;
};

const SectionTitle: React.FC<SectionTitleProps & WithTestID> = ({ title, testId }) => (
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
  // { title: 'Vendor' }, TODO(mlibra): search HW database for humanized values
  { title: 'Model' },
  { title: 'WWN' },
];

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const diskRowKey = ({ rowData }: ExtraParamsType) => rowData?.key;

const DisksTableRowWrapper = (props: RowWrapperProps) => (
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  <RowWrapper {...props} data-testid={`disk-row:${props.row?.key}`} />
);

const DisksTable: React.FC<DisksTableProps & WithTestID> = ({
  canEditDisks,
  host,
  disks,
  installationDiskId,
  testId,
  onDiskRole,
}) => {
  const isEditable = !!canEditDisks?.(host);
  const rows: IRow[] = [...disks]
    .sort((diskA, diskB) => diskA.name?.localeCompare(diskB.name || '') || 0)
    .map((disk) => ({
      cells: [
        {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          title: disk.bootable ? `${disk.name} (bootable)` : disk.name,
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
        // disk.vendor, TODO(mlibra): search HW database for humanized values
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

export const StorageDetail: React.FC<StorageDetailProps> = ({ canEditDisks, onDiskRole, host }) => {
  const { installationDiskId } = host;
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
          installationDiskId={installationDiskId}
          onDiskRole={onDiskRole}
        />
      </GridItem>
    </Grid>
  );
};
