import React from 'react';
import {
  TextContent,
  Text,
  TextVariants,
  Grid,
  GridItem,
  Checkbox,
  Popover,
  Tooltip,
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
import {
  Disk,
  fileSize,
  getInventory,
  Host,
  trimCommaSeparatedList,
  WithTestID,
} from '../../index';
import DiskRole, { OnDiskRoleType } from '../hosts/DiskRole';
import DiskLimitations from '../hosts/DiskLimitations';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';

type StorageDetailProps = {
  host: Host;
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: OnDiskRoleType;
  updateDiskSkipFormatting?: (
    doFormatDisk: boolean,
    hostId: Host['id'],
    diskId: Disk['id'],
  ) => Promise<unknown>;
};

interface SectionTitleProps extends WithTestID {
  title: string;
}

interface DisksTableProps extends WithTestID {
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: OnDiskRoleType;
  host: Host;
  disks: Disk[];
  installationDiskId?: string;
  updateDiskSkipFormatting?: (
    doFormatDisk: boolean,
    hostId: Host['id'],
    diskId: Disk['id'],
  ) => Promise<unknown>;
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
  { title: 'Will be formatted' },
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

const isDiskFormattable = (host: Host, diskId: string | undefined) => {
  return (
    trimCommaSeparatedList(host.disksToBeFormatted ? host.disksToBeFormatted : '')
      .split(',')
      .filter((diskToBeFormatted) => diskToBeFormatted === diskId).length > 0
  );
};
const isDiskSkipFormatting = (host: Host, diskId: string | undefined) => {
  return (
    trimCommaSeparatedList(host.skipFormattingDisks ? host.skipFormattingDisks : '')
      .split(',')
      .filter((diskSkipFormatting) => diskSkipFormatting === diskId).length > 0
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
  const isEditable = !!canEditDisks?.(host);

  const isInstallationDisk = (disk: Disk) => disk.id === installationDiskId;
  console.log(isInstallationDisk);
  const rows: IRow[] = [...disks]
    .sort((diskA, diskB) => diskA.name?.localeCompare(diskB.name || '') || 0)
    .map((disk) => ({
      cells: [
        {
          title: (
            <>
              {isDiskSkipFormatting(host, disk.id) && (
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
        { title: disk.driveType, props: { 'data-testid': 'drive-type' } },
        { title: fileSize(disk.sizeBytes || 0, 2, 'si'), props: { 'data-testid': 'disk-size' } },
        { title: disk.serial, props: { 'data-testid': 'disk-serial' } },
        { title: disk.model, props: { 'data-testid': 'disk-model' } },
        { title: disk.wwn, props: { 'data-testid': 'disk-wwn' } },
        (isDiskFormattable(host, disk.id) || isInstallationDisk(disk)) && {
          title: (
            <Tooltip
              hidden={!isInstallationDisk(disk)}
              content={'Installation disks are always being formatted'}
            >
              <Checkbox
                id={`select-formatted}`}
                isChecked={isInstallationDisk(disk) || !isDiskSkipFormatting(host, disk.id)}
                onChange={(doFormatDisk: boolean) =>
                  updateDiskSkipFormatting
                    ? updateDiskSkipFormatting(doFormatDisk, host.id, disk.id)
                    : ''
                }
                isDisabled={isInstallationDisk(disk)}
              />
            </Tooltip>
          ),
          props: { 'data-testid': 'disk-formatted' },
        },
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

const StorageDetail = ({
  host,
  canEditDisks,
  onDiskRole,
  updateDiskSkipFormatting,
}: StorageDetailProps) => {
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
          updateDiskSkipFormatting={updateDiskSkipFormatting}
        />
      </GridItem>
    </Grid>
  );
};

export default StorageDetail;
