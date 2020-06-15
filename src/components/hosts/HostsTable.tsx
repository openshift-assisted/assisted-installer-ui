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
import { Host, Cluster, Inventory } from '../../api/types';
import { enableClusterHost, disableClusterHost, deleteClusterHost } from '../../api/clusters';
import { Alerts, Alert } from '../ui/Alerts';
import { EventsModal } from '../ui/eventsModal';
import { getHostRowHardwareInfo, getDateTimeCell } from './hardwareInfo';
import { DiscoveryImageModalButton } from '../clusterConfiguration/discoveryImageModal';
import HostStatus from './HostStatus';
import { HostDetail } from './HostRowDetail';
import { forceReload } from '../../features/clusters/currentClusterSlice';
import { handleApiError, stringToJSON } from '../../api/utils';
import sortable from '../ui/table/sortable';
import RoleCell, { getHostRole } from './RoleCell';
import { DASH } from '../constants';

import './HostsTable.css';
import DeleteHostModal from './DeleteHostModal';

type HostsTableProps = {
  cluster: Cluster;
};

type OpenRows = {
  [id: string]: boolean;
};

type HostToDelete = {
  id: string;
  hostname: string;
};

const columns = [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Created At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
];

const hostToHostTableRow = (openRows: OpenRows) => (host: Host): IRow => {
  const { id, status, createdAt, inventory: inventoryString = '' } = host;
  const inventory = stringToJSON<Inventory>(inventoryString) || {};
  const { cores, memory, disk } = getHostRowHardwareInfo(inventory);

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        inventory.hostname || { title: DASH, sortableValue: '' },
        {
          title: <RoleCell host={host} />,
          sortableValue: getHostRole(host),
        },
        {
          title: <HostStatus host={host} />,
          sortableValue: status,
        },
        getDateTimeCell(createdAt),
        cores,
        memory,
        disk,
      ],
      extraData: host,
      inventory,
      key: `${host.id}-master`,
    },
    {
      // expandable detail
      // parent will be set after sorting
      fullWidth: true,
      cells: [{ title: <HostDetail key={id} inventory={inventory} /> }],
      key: `${host.id}-detail`,
    },
  ];
};

const HostsTableEmptyState: React.FC<{ cluster: Cluster }> = ({ cluster }) => (
  <EmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Boot the discovery ISO on hardware that should become part of this bare metal cluster. Hosts may take a few minutes after to appear here after booting."
    primaryAction={<DiscoveryImageModalButton imageInfo={cluster.imageInfo} />}
  />
);

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.key;

const HostsTable: React.FC<HostsTableProps> = ({ cluster }) => {
  const [showEventsModal, setShowEventsModal] = React.useState<Host['id']>('');
  const [openRows, setOpenRows] = React.useState({} as OpenRows);
  const [hostToDelete, setHostToDelete] = React.useState<HostToDelete>();
  const [alerts, setAlerts] = React.useState([] as Alert[]);
  const [sortBy, setSortBy] = React.useState({
    index: 1, // Hostname-column
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
    return getColSpanRow(<HostsTableEmptyState cluster={cluster} />, columns.length);
  }, [hostRows, cluster]);

  const onCollapse = React.useCallback(
    (_event, rowKey) => {
      const host = hostRows[rowKey].extraData;
      const id = (host && host.id) as string;
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

  const onDeleteHost = React.useCallback(
    async (hostId) => {
      try {
        await deleteClusterHost(cluster.id, hostId);
        dispatch(forceReload());
      } catch (e) {
        return handleApiError(e, () =>
          addAlert({
            key: `delete-${hostId}`,
            variant: AlertVariant.danger,
            text: `Failed to delete host ${hostId}`,
          }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
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

  const onViewHostEvents = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.extraData.id;
      setShowEventsModal(hostId);
    },
    [],
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
      actions.push({
        title: 'View Host Events History',
        onClick: onViewHostEvents,
      });
      if (!['installing', 'installing-in-progress', 'error', 'installed'].includes(host.status)) {
        actions.push({
          title: 'Delete',
          onClick: (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
            const hostId = rowData.extraData.id;
            const hostname = rowData.inventory.hostname;
            setHostToDelete({ id: hostId, hostname });
          },
        });
      }

      return actions;
    },
    [onHostEnable, onHostDisable, onViewHostEvents],
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
      <EventsModal
        title="Host Events"
        entityKind="host"
        entityId={showEventsModal}
        onClose={() => setShowEventsModal('')}
        isOpen={!!showEventsModal}
      />
      <DeleteHostModal
        hostname={hostToDelete?.hostname}
        onClose={() => setHostToDelete(undefined)}
        isOpen={!!hostToDelete}
        onDelete={() => {
          onDeleteHost(hostToDelete?.id);
          setHostToDelete(undefined);
        }}
      />
      {/*TODO(jtomasek): Remove this and replace alerts below hosts table with global alerts*/}
      <Alerts alerts={alerts} className="host-table-alerts" />
    </>
  );
};

export default HostsTable;
