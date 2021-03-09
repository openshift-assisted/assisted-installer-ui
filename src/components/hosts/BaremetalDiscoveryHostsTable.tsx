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
import { getHostname, getHostRole } from './utils';
import Hostname from './Hostname';
import { DASH } from '../constants';
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

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        {
          title: computedHostname ? (
            <Hostname host={host} inventory={inventory} cluster={cluster} />
          ) : (
            DASH
          ),
          sortableValue: computedHostname || '',
        },
        {
          title: <RoleCell host={host} clusterStatus={cluster.status} />,
          sortableValue: getHostRole(host),
        },
        {
          title: <HardwareStatus host={host} cluster={cluster} validationsInfo={validationsInfo} />,
          sortableValue: status,
        },
        getDateTimeCell(createdAt),
        {
          title: (
            <HostPropertyValidationPopover validation={cpuCoresValidation}>
              {cores.title}
            </HostPropertyValidationPopover>
          ),
          sortableValue: cores.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={memoryValidation}>
              {memory.title}
            </HostPropertyValidationPopover>
          ),
          sortableValue: memory.sortableValue,
        },
        {
          title: (
            <HostPropertyValidationPopover validation={diskValidation}>
              {disk.title}
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

type BaremetalDiscoveryHostsTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

const BaremetalDiscoveryHostsTable: React.FC<BaremetalDiscoveryHostsTableProps> = (props) => {
  return <HostsTable {...props} getColumns={getColumns} hostToHostTableRow={hostToHostTableRow} />;
};

export default BaremetalDiscoveryHostsTable;
