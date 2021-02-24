import React from 'react';
import { TextContent, Text, TextVariants, Grid, GridItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import { Host, Inventory, Disk, Interface, Cluster } from '../../api/types';
import { getHostRowHardwareInfo } from './hardwareInfo';
import { DASH } from '../constants';
import { DetailList, DetailListProps, DetailItem } from '../ui/DetailList';
import { ValidationsInfo } from '../../types/hosts';
import NtpValidationStatus from './NtpValidationStatus';
import DiskLimitations from './DiskLimitations';
import DiskRole from './DiskRole';
import { canEditDisks, getHardwareTypeText, fileSize } from './utils';

type HostDetailProps = {
  cluster: Cluster;
  inventory: Inventory;
  host: Host;
  validationsInfo: ValidationsInfo;
};

type SectionTitleProps = {
  title: string;
};

type SectionColumnProps = {
  children: DetailListProps['children'];
};

type DisksTableProps = {
  cluster: Cluster;
  host: Host;
  disks: Disk[];
  installationDiskPath?: string;
};

type NicsTableProps = {
  interfaces: Interface[];
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <GridItem>
    <TextContent>
      <Text component={TextVariants.h3}>{title}</Text>
    </TextContent>
  </GridItem>
);

const SectionColumn: React.FC<SectionColumnProps> = ({ children }) => (
  <GridItem span={4}>
    <DetailList>{children}</DetailList>
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

const diskRowKey = ({ rowData }: ExtraParamsType) => rowData?.key;

const DisksTable: React.FC<DisksTableProps> = ({ cluster, host, disks, installationDiskPath }) => {
  const isEditable = canEditDisks(cluster.status, host.status);
  const rows = disks
    .sort((diskA, diskB) => diskA.name?.localeCompare(diskB.name || '') || 0)
    .map((disk) => ({
      cells: [
        { title: disk.bootable ? `${disk.name} (bootable)` : disk.name },
        {
          title: (
            <DiskRole
              host={host}
              disk={disk}
              installationDiskPath={installationDiskPath}
              isEditable={isEditable}
            />
          ),
        },
        { title: <DiskLimitations disk={disk} /> },
        disk.driveType,
        fileSize(disk.sizeBytes || 0, 2, 'si'),
        disk.serial,
        // disk.vendor, TODO(mlibra): search HW database for humanized values
        disk.model,
        disk.wwn,
      ],
      key: disk.path,
    }));

  return (
    <Table
      rows={rows}
      cells={diskColumns}
      variant={TableVariant.compact}
      aria-label="Host's disks table"
      borders={false}
    >
      <TableHeader />
      <TableBody rowKey={diskRowKey} />
    </Table>
  );
};

const nicsColumns = [
  { title: 'Name' },
  { title: 'MAC address' },
  { title: 'IPv4 address' },
  { title: 'IPv6 address' },
  { title: 'Speed' },
  // { title: 'Vendor' }, TODO(mlibra): search HW database for humanized values
  // { title: 'Product' },
];

const nicsRowKey = ({ rowData }: ExtraParamsType) => rowData?.name?.title;

const NicsTable: React.FC<NicsTableProps> = ({ interfaces }) => {
  const rows = interfaces
    .sort((nicA, nicB) => nicA.name?.localeCompare(nicB.name || '') || 0)
    .map((nic) => ({
      cells: [
        nic.name,
        nic.macAddress,
        (nic.ipv4Addresses || []).join(', '),
        (nic.ipv6Addresses || []).join(', '),
        `${nic.speedMbps && nic.speedMbps > 0 ? `${nic.speedMbps} Mbps` : 'N/A'}`,
      ],
    }));

  return (
    <Table
      rows={rows}
      cells={nicsColumns}
      variant={TableVariant.compact}
      aria-label="Host's network interfaces table"
      borders={false}
    >
      <TableHeader />
      <TableBody rowKey={nicsRowKey} />
    </Table>
  );
};

export const HostDetail: React.FC<HostDetailProps> = ({
  cluster,
  inventory,
  host,
  validationsInfo,
}) => {
  const { id, installationDiskPath } = host;
  const rowInfo = getHostRowHardwareInfo(inventory);
  const disks = inventory.disks || [];
  const nics = inventory.interfaces || [];

  let bmcAddress = inventory.bmcAddress;
  if (inventory.bmcV6address) {
    bmcAddress = bmcAddress ? `${bmcAddress}, ${inventory.bmcV6address}` : inventory.bmcV6address;
  }
  bmcAddress = bmcAddress || DASH;

  const hardwareType = getHardwareTypeText(inventory);

  return (
    <Grid hasGutter>
      <SectionTitle title="Host Details" />
      <SectionColumn>
        <DetailItem title="UUID" value={id} />
        <DetailItem title="Manufacturer" value={inventory.systemVendor?.manufacturer || DASH} />
        <DetailItem title="Product" value={inventory.systemVendor?.productName || DASH} />
        <DetailItem title="Serial number" value={rowInfo.serialNumber} />
      </SectionColumn>
      <SectionColumn>
        <DetailItem title="Memory capacity" value={rowInfo.memory.title} />
        <DetailItem title="CPU model name" value={inventory.cpu?.modelName || DASH} />
        <DetailItem title="CPU cores and clock speed" value={rowInfo.cpuSpeed} />
        <DetailItem title="CPU architecture" value={inventory.cpu?.architecture || DASH} />
      </SectionColumn>
      <SectionColumn>
        <DetailItem title="Hardware type" value={hardwareType} />
        <DetailItem title="BMC address" value={bmcAddress} />
        <DetailItem title="Boot mode" value={inventory.boot?.currentBootMode || DASH} />
        {inventory.boot?.pxeInterface && (
          <DetailItem title="PXE interface" value={inventory.boot?.pxeInterface} />
        )}
        <DetailItem
          title="NTP status"
          value={<NtpValidationStatus validationsInfo={validationsInfo} />}
        />
      </SectionColumn>

      <SectionTitle title={`${disks.length} Disk${disks.length === 1 ? '' : 's'}`} />
      <GridItem>
        <DisksTable
          cluster={cluster}
          host={host}
          disks={disks}
          installationDiskPath={installationDiskPath}
        />
      </GridItem>

      <SectionTitle title={`${nics.length} NIC${nics.length === 1 ? '' : 's'}`} />
      <GridItem>
        <NicsTable interfaces={nics} />
      </GridItem>
    </Grid>
  );
};
