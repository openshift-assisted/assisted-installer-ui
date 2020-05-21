import React from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  IRow,
  expandable,
  IRowData,
  SortByDirection,
  ISortBy,
  OnSort,
} from '@patternfly/react-table';
import { ConnectedIcon } from '@patternfly/react-icons';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import { AlertVariant } from '@patternfly/react-core';
import { EmptyState } from '../ui/uiState';
import { getColSpanRow, rowSorter } from '../ui/table/utils';
import { Host, Cluster } from '../../api/types';
import { enableClusterHost, disableClusterHost } from '../../api/clusters';
import { Alerts, Alert } from '../ui/Alerts';
import { getHostRowHardwareInfo, getHardwareInfo, getHumanizedTime } from './hardwareInfo';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import HostStatus from './HostStatus';
import { HostDetail } from './HostRowDetail';
import { RoleDropdown } from './RoleDropdown';
import { forceReload } from '../../features/clusters/currentClusterSlice';
import { handleApiError } from '../../api/utils';
import sortable from '../ui/table/sortable';

import './HostsTable.css';

type HostsTableProps = {
  cluster: Cluster;
};

type OpenRows = {
  [id: string]: boolean;
};

const columns = [
  {
    title: 'ID',
    cellFormatters: [expandable],
    transforms: [sortable],
  },
  { title: 'Role', transforms: [sortable] },
  { title: 'Serial Number', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Created At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
];

const hostToHostTableRow = (openRows: OpenRows) => (host: Host, idx: number): IRow => {
  const { id, status, statusInfo, role, createdAt, hardwareInfo = '' } = host;
  const hwInfo = getHardwareInfo(hardwareInfo) || {};
  const { cores, memory, disk } = getHostRowHardwareInfo(hwInfo);
  const roleCellTitle = ['installing', 'installed', 'error'].includes(status) ? (
    role
  ) : (
    <RoleDropdown role={role} host={host} />
  );

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        id,
        {
          title: roleCellTitle,
          sortableValue: role,
        },
        id, // TODO(mlibra): should be serial number
        {
          title: <HostStatus status={status} statusInfo={statusInfo} />,
          sortableValue: status,
        },
        getHumanizedTime(createdAt),
        cores,
        memory,
        disk,
      ],
      extraData: host,
    },
    {
      // expandable detail
      // parent will be set after sorting
      fullWidth: true,
      cells: [{ title: <HostDetail key={id} hwInfo={hwInfo} /> }],
    },
  ];
};

const HostsTableEmptyState: React.FC = () => (
  <EmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Boot the discovery ISO on a hardware that should become part of this bare metal cluster. After booting the ISO the hosts get inspected and register to the cluster. At least 3 bare metal hosts are required to form the cluster."
    primaryAction={<DiscoveryImageModalButton />}
  />
);

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.id?.title;

const HostsTable: React.FC<HostsTableProps> = ({ cluster }) => {
  const [openRows, setOpenRows] = React.useState({} as OpenRows);
  const [alerts, setAlerts] = React.useState([] as Alert[]);
  const [sortBy, setSortBy] = React.useState({
    index: 2, // Role-column
    direction: SortByDirection.asc,
  } as ISortBy);
  const dispatch = useDispatch();

  const hostRows = React.useMemo(
    () =>
      _.flatten(
        (cluster.hosts || [])
          .map(hostToHostTableRow(openRows))
          .sort(rowSorter(sortBy, (row: IRow, index = 1) => row[0].cells[index - 1]))
          .map((row: IRow, index: number) => {
            row[1].parent = index * 2;
            return row;
          }),
      ),
    [cluster.hosts, openRows, sortBy],
  );

  const rows = React.useMemo(() => {
    if (hostRows.length) {
      return hostRows;
    }
    return getColSpanRow(HostsTableEmptyState, columns.length);
  }, [hostRows]);

  const onCollapse = React.useCallback(
    (_event, rowKey) => {
      const cells = hostRows[rowKey].cells;
      const id = (cells && cells[0]) as string;
      if (id) {
        setOpenRows(Object.assign({}, openRows, { [id]: !openRows[id] }));
      }
    },
    [hostRows, openRows],
  );

  const addAlert = React.useCallback(
    (alert: Alert) => {
      if (alert.key) {
        alert.onClose = () => {
          setAlerts(alerts.filter((a) => a.key !== alert.key));
        };

        // remove existing and place new on the top
        setAlerts([alert, ...alerts.filter((a) => a.key !== alert.key)]);
      } else {
        setAlerts([alert, ...alerts]);
      }
    },
    [alerts, setAlerts],
  );

  const onHostEnable = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.extraData.id;
      enableClusterHost(cluster.id, hostId)
        .then(() => {
          dispatch(forceReload());
        })
        .catch((err) => {
          handleApiError(err, () => {
            addAlert({
              key: `enable-${hostId}`,
              variant: AlertVariant.warning,
              text: `Failed to enable host ${hostId}`,
            });
          });
        });
    },
    [cluster.id, dispatch, addAlert],
  );

  const onHostDisable = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.extraData.id;
      disableClusterHost(cluster.id, hostId)
        .then(() => {
          dispatch(forceReload());
        })
        .catch((err) => {
          handleApiError(err, () => {
            addAlert({
              key: `disable-${hostId}`,
              variant: AlertVariant.warning,
              text: `Failed to disable host ${hostId}`,
            });
          });
        });
    },
    [cluster.id, dispatch, addAlert],
  );

  const actionResolver = React.useCallback(
    (rowData: IRowData) => {
      const host = rowData.extraData;
      if (!host) {
        // I.e. row with detail
        return [];
      }

      const actions = [];
      if (host.status === 'disabled') {
        actions.push({
          title: 'Enable in cluster',
          onClick: onHostEnable,
        });
      }
      if (['discovering', 'disconnected', 'known', 'insufficient'].includes(host.status)) {
        actions.push({
          title: 'Disable in cluster',
          onClick: onHostDisable,
        });
      }

      return actions;
    },
    [onHostEnable, onHostDisable],
  );

  const onSort: OnSort = React.useCallback(
    (_event, index, direction) => {
      setOpenRows({}); // collapse all
      setSortBy({
        index,
        direction,
      });
    },
    [setSortBy, setOpenRows],
  );

  return (
    <>
      <Table
        rows={rows}
        cells={columns}
        onCollapse={onCollapse}
        variant={TableVariant.compact}
        aria-label="Hosts table"
        actionResolver={actionResolver}
        className="hosts-table"
        sortBy={sortBy}
        onSort={onSort}
      >
        <TableHeader />
        <TableBody rowKey={rowKey} />
      </Table>
      <Alerts alerts={alerts} className="host-table-alerts" />
    </>
  );
};

export default HostsTable;
