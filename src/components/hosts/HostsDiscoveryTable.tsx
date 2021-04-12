import React from 'react';
import { IRow, sortable, expandable } from '@patternfly/react-table';
import { Cluster, Host, Inventory } from '../../api/types';
import { HostsTable } from '.';
import { HostDetail } from './HostRowDetail';
import HostPropertyValidationPopover from './HostPropertyValidationPopover';
import { OpenRows } from './HostsTable';
import { stringToJSON } from '../../api/utils';
import { getHostRowHardwareInfo } from './hardwareInfo';
import { ValidationsInfo } from '../../types/hosts';
import { canEditRole, getHostname, getHostRole } from './utils';
import Hostname from './Hostname';
import RoleCell from './RoleCell';
import HardwareStatus from './HardwareStatus';
import { getDateTimeCell } from '../ui/table/utils';
import { HostsNotShowingLinkProps } from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import HostsCount from './HostsCount';

const getColumns = (hosts?: Host[]) => [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
  { title: <HostsCount hosts={hosts} inParenthesis /> },
];

const hostToHostTableRow = (openRows: OpenRows, cluster: Cluster) => (host: Host): IRow => {
  const { id, status, createdAt, inventory: inventoryString = '' } = host;
  const inventory = stringToJSON<Inventory>(inventoryString) || {};
  const { cores, memory, disk } = getHostRowHardwareInfo(inventory);
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const memoryValidation = validationsInfo?.hardware?.find((v) => v.id === 'has-memory-for-role');
  const diskValidation = validationsInfo?.hardware?.find((v) => v.id === 'has-min-valid-disks');
  const cpuCoresValidation = validationsInfo?.hardware?.find(
    (v) => v.id === 'has-cpu-cores-for-role',
  );
  const computedHostname = getHostname(host, inventory);
  const hostRole = getHostRole(host);
  const dateTimeCell = getDateTimeCell(createdAt);

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        {
          title: (
            <Hostname testId={`host-name`} host={host} inventory={inventory} cluster={cluster} />
          ),
          sortableValue: computedHostname || '',
        },
        {
          title: (
            <RoleCell
              testId={`host-role`}
              host={host}
              readonly={!canEditRole(cluster, host.status)}
              role={hostRole}
            />
          ),
          sortableValue: hostRole,
        },
        {
          title: (
            <HardwareStatus
              testId={`host-hw-status`}
              host={host}
              cluster={cluster}
              validationsInfo={validationsInfo}
            />
          ),
          sortableValue: status,
        },
        {
          title: <span data-testid={`host-discovered-time`}>{dateTimeCell.title}</span>,
          sortableValue: dateTimeCell.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={cpuCoresValidation}>
              <span data-testid={`host-cpu-cores`}>{cores.title}</span>
            </HostPropertyValidationPopover>
          ),
          sortableValue: cores.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={memoryValidation}>
              <span data-testid={`host-memory`}>{memory.title}</span>
            </HostPropertyValidationPopover>
          ),
          sortableValue: memory.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={diskValidation}>
              <span data-testid={`host-disk`}>{disk.title}</span>
            </HostPropertyValidationPopover>
          ),
          sortableValue: disk.sortableValue,
        },
      ],
      host,
      clusterStatus: cluster.status,
      inventory,
      key: `${host.id}-master`,
    },
    {
      // expandable detail
      // parent will be set after sorting
      fullWidth: true,
      cells: [
        {
          title: (
            <HostDetail
              key={id}
              cluster={cluster}
              inventory={inventory}
              host={host}
              validationsInfo={validationsInfo}
            />
          ),
        },
      ],
      key: `${host.id}-detail`,
      inventory,
    },
  ];
};

type HostsDiscoveryTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

const HostsDiscoveryTable: React.FC<HostsDiscoveryTableProps> = (props) => {
  return (
    <HostsTable
      {...props}
      testId={'hosts-discovery-table'}
      getColumns={getColumns}
      hostToHostTableRow={hostToHostTableRow}
    />
  );
};

export default HostsDiscoveryTable;
