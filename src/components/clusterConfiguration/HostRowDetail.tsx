import React, { ReactChild } from 'react';
import Humanize from 'humanize-plus';
import {
  Flex,
  FlexItem,
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  Text,
  TextVariants,
  FlexModifiers,
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import { Introspection, BlockDevice, Nic } from '../../api/types';
import { getHostRowHardwareInfo } from './hardwareInfo';

import './HostRowDetail.css';
import { DASH } from '../constants';

type HostDetailProps = {
  hwInfo: Introspection;
};

type HostDetailItemProps = {
  title: string;
  value?:
    | {
        title: string;
        value?: string;
      }[]
    | React.ReactNode;
};

type SectionTitleProps = {
  title: string;
};

type SectionColumnProps = {
  children: ReactChild | ReactChild[];
};

type DisksTableProps = {
  disks: BlockDevice[];
};

type NicsTableProps = {
  nics: Nic[];
};

const HostDetailItem: React.FC<HostDetailItemProps> = ({ title, value = '' }) => {
  return (
    <>
      <Text component={TextVariants.h6} className="host-row-detail-item__title">
        {title}
      </Text>
      <div>
        {Array.isArray(value) ? (
          <TextList component={TextListVariants.dl}>
            {value.map((item) => [
              <TextListItem key={item.title} component={TextListItemVariants.dt}>
                {item.title}
              </TextListItem>,
              <TextListItem key={`dd-${item.title}`} component={TextListItemVariants.dd}>
                {item.value}
              </TextListItem>,
            ])}
          </TextList>
        ) : (
          value
        )}
      </div>
    </>
  );
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <FlexItem
    breakpointMods={[{ modifier: FlexModifiers['full-width'] }]}
    className="host-row-detail__section"
  >
    <TextContent>
      <Text component={TextVariants.h3}>{title}</Text>
    </TextContent>
  </FlexItem>
);

const SectionColumn: React.FC<SectionColumnProps> = ({ children }) => (
  <FlexItem breakpointMods={[{ modifier: FlexModifiers['grow'] }]}>
    <TextContent>{children}</TextContent>
  </FlexItem>
);

const diskColumns = [
  { title: 'Name' },
  { title: 'Size' },
  { title: 'Device type' },
  { title: 'fstype' },
  { title: 'Removeable' },
  { title: 'Device number' },
  { title: 'Mount point' },
];

const diskRowKey = ({ rowData }: ExtraParamsType) => rowData?.name?.title;

const DisksTable: React.FC<DisksTableProps> = ({ disks }) => {
  const rows = disks
    .sort((diskA, diskB) => diskA.name?.localeCompare(diskB.name || '') || 0)
    .map((disk) => ({
      cells: [
        disk.name,
        Humanize.fileSize(disk.size || 0),
        disk.deviceType,
        disk.fstype,
        disk.removableDevice,
        disk.majorDeviceNumber ? `(${disk.majorDeviceNumber}, ${disk.minorDeviceNumber})` : '',
        disk.mountpoint,
      ],
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
  { title: 'IP address' },
  // { title: 'Latency' }, TODO(mlibra)
  { title: 'State' },
];

const nicsRowKey = ({ rowData }: ExtraParamsType) => rowData?.name?.title;

const NicsTable: React.FC<NicsTableProps> = ({ nics }) => {
  const rows = nics
    .sort((nicA, nicB) => nicA.name?.localeCompare(nicB.name || '') || 0)
    .map((nic) => ({
      cells: [
        nic.name,
        nic.mac,
        nic.cidrs?.map((cidr) => `${cidr.ipAddress}/${cidr.mask}`).join(','),
        // TODO(mlibra): latency
        nic.state,
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

export const HostDetail: React.FC<HostDetailProps> = ({ hwInfo }) => {
  const rowInfo = getHostRowHardwareInfo(hwInfo);
  return (
    <Flex className="host-row-detail">
      <SectionTitle title="Host Details" />
      <SectionColumn>
        <HostDetailItem title="CPU architecture" value={hwInfo.cpu?.architecture || DASH} />
        <HostDetailItem title="Model name" value={hwInfo.cpu?.modelName || DASH} />
        {/* TODO(mlibra): <HostDetailItem title="Motherboard serial number" value={} /> */}
      </SectionColumn>
      <SectionColumn>
        <HostDetailItem title="Memory capacity" value={rowInfo.memory.title} />
        <HostDetailItem title="CPU clock speed" value={rowInfo.cpuSpeed} />
      </SectionColumn>
      <SectionColumn>
        <HostDetailItem title="Sockets" value={hwInfo.cpu?.sockets || DASH} />
        <HostDetailItem title="Threads per core" value={hwInfo.cpu?.threadsPerCore || DASH} />
      </SectionColumn>

      <SectionTitle title={`${rowInfo.disks.length} Disks`} />
      <SectionColumn>
        <DisksTable disks={rowInfo.disks} />
      </SectionColumn>

      <SectionTitle title={`${rowInfo.nics.length} NICs`} />
      <SectionColumn>
        <NicsTable nics={rowInfo.nics} />
      </SectionColumn>
    </Flex>
  );
};
