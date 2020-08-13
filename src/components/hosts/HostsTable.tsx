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
import { EmptyState } from '../ui/uiState';
import { getColSpanRow, rowSorter } from '../ui/table/utils';
import { Host, Cluster, Inventory } from '../../api/types';
import { enableClusterHost, disableClusterHost, deleteClusterHost } from '../../api/clusters';
import { EventsModal } from '../ui/eventsModal';
import { getHostRowHardwareInfo, getDateTimeCell } from './hardwareInfo';
import { DiscoveryImageModalButton } from '../clusterConfiguration/discoveryImageModal';
import HostStatus from './HostStatus';
import { HostDetail } from './HostRowDetail';
import { forceReload, updateHost } from '../../features/clusters/currentClusterSlice';
import { handleApiError, stringToJSON, getErrorMessage } from '../../api/utils';
import sortable from '../ui/table/sortable';
import RoleCell, { getHostRole } from './RoleCell';
import { DASH } from '../constants';
import DeleteHostModal from './DeleteHostModal';
import { AlertsContext } from '../AlertsContextProvider';
import { canEnable, canDisable, canDelete } from './utils';
import EditHostModal from './EditHostModal';
import Hostname, { computeHostname } from './Hostname';

import './HostsTable.css';
import HostsCount from './HostsCount';

type HostsTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
};

type OpenRows = {
  [id: string]: boolean;
};

type HostToDelete = {
  id: string;
  hostname: string;
};

const getColumns = (hosts?: Host[]) => [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
  { title: <HostsCount hosts={hosts} /> },
];

const hostToHostTableRow = (openRows: OpenRows, cluster: Cluster) => (host: Host): IRow => {
  const { id, status, createdAt, inventory: inventoryString = '' } = host;
  const inventory = stringToJSON<Inventory>(inventoryString) || {};
  const { cores, memory, disk } = getHostRowHardwareInfo(inventory);
  const computedHostname = computeHostname(host, inventory);
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
          title: <HostStatus host={host} />,
          sortableValue: status,
        },
        getDateTimeCell(createdAt),
        cores,
        memory,
        disk,
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
      cells: [{ title: <HostDetail key={id} inventory={inventory} /> }],
      key: `${host.id}-detail`,
      inventory,
    },
  ];
};

const HostsTableEmptyState: React.FC<{ cluster: Cluster }> = ({ cluster }) => (
  <EmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Boot the discovery ISO on hardware that should become part of this bare metal cluster. Hosts may take a few minutes to appear here after booting."
    primaryAction={<DiscoveryImageModalButton imageInfo={cluster.imageInfo} />}
  />
);

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.key;
const isHostShown = (skipDisabled: boolean) => (host: Host) =>
  !skipDisabled || host.status != 'disabled';

const HostsTable: React.FC<HostsTableProps> = ({ cluster, skipDisabled = false }) => {
  const { addAlert } = React.useContext(AlertsContext);
  const [showEventsModal, setShowEventsModal] = React.useState<Host['id']>('');
  const [showEditHostModal, setShowEditHostModal] = React.useState<
    { host: Host; inventory: Inventory } | undefined
  >(undefined);
  const [openRows, setOpenRows] = React.useState({} as OpenRows);
  const [hostToDelete, setHostToDelete] = React.useState<HostToDelete>();
  const [sortBy, setSortBy] = React.useState({
    index: 1, // Hostname-column
    direction: SortByDirection.asc,
  } as ISortBy);
  const dispatch = useDispatch();

  const hostRows = React.useMemo(
    () =>
      _.flatten(
        (cluster.hosts || [])
          .filter(isHostShown(skipDisabled))
          .map(hostToHostTableRow(openRows, cluster))
          .sort(rowSorter(sortBy, (row: IRow, index = 1) => row[0].cells[index - 1]))
          .map((row: IRow, index: number) => {
            row[1].parent = index * 2;
            return row;
          }),
      ),
    [cluster, skipDisabled, openRows, sortBy],
  );

  const columns = React.useMemo(() => getColumns(cluster.hosts), [cluster.hosts]);

  const rows = React.useMemo(() => {
    if (hostRows.length) {
      return hostRows;
    }
    return getColSpanRow(<HostsTableEmptyState cluster={cluster} />, columns.length);
  }, [hostRows, cluster, columns]);

  const onCollapse = React.useCallback(
    (_event, rowKey) => {
      const host: Host = hostRows[rowKey].host;
      const id = (host && host.id) as string;
      if (id) {
        setOpenRows(Object.assign({}, openRows, { [id]: !openRows[id] }));
      }
    },
    [hostRows, openRows],
  );

  const onDeleteHost = React.useCallback(
    async (hostId) => {
      try {
        await deleteClusterHost(cluster.id, hostId);
        dispatch(forceReload());
      } catch (e) {
        return handleApiError(e, () =>
          addAlert({ title: `Failed to delete host ${hostId}`, message: getErrorMessage(e) }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
  );

  const onHostEnable = React.useCallback(
    async (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.host.id;
      try {
        const { data } = await enableClusterHost(cluster.id, hostId);
        dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: `Failed to enable host ${hostId}`, message: getErrorMessage(e) }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
  );

  const onHostDisable = React.useCallback(
    async (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.host.id;
      try {
        const { data } = await disableClusterHost(cluster.id, hostId);
        dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: `Failed to disable host ${hostId}`, message: getErrorMessage(e) }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
  );

  const onViewHostEvents = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.host.id;
      setShowEventsModal(hostId);
    },
    [],
  );

  const onEditHost = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      setShowEditHostModal({ host: rowData.host, inventory: rowData.inventory });
    },
    [],
  );

  const actionResolver = React.useCallback(
    (rowData: IRowData) => {
      const host: Host | undefined = rowData.host;
      const clusterStatus: Cluster['status'] = rowData.clusterStatus;
      const hostname = rowData.host?.requestedHostname || rowData.inventory?.hostname;

      if (!host) {
        // I.e. row with detail
        return [];
      }

      const actions = [];

      actions.push({
        title: 'Edit Host',
        id: `button-edit-host-${hostname}`, // id is everchanging, not ideal for tests
        onClick: onEditHost,
      });
      if (canEnable(clusterStatus, host.status)) {
        actions.push({
          title: 'Enable in cluster',
          id: `button-enable-in-cluster-${hostname}`,
          onClick: onHostEnable,
        });
      }
      if (canDisable(clusterStatus, host.status)) {
        actions.push({
          title: 'Disable in cluster',
          id: `button-disable-in-cluster-${hostname}`,
          onClick: onHostDisable,
        });
      }
      actions.push({
        title: 'View Host Events',
        id: `button-view-host-events-${hostname}`,
        onClick: onViewHostEvents,
      });
      if (canDelete(clusterStatus, host.status)) {
        actions.push({
          title: 'Delete',
          id: `button-delete-host-${hostname}`,
          onClick: () => {
            setHostToDelete({ id: host.id, hostname });
          },
        });
      }

      return actions;
    },
    [onHostEnable, onHostDisable, onViewHostEvents, onEditHost],
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

  const getHostInventory = (hostId: Host['id']): Inventory =>
    hostRows.find((rowData) => rowData.host?.id === hostId)?.inventory;

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
        title={`Host Events: ${getHostInventory(showEventsModal)?.hostname || showEventsModal}`}
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
      <EditHostModal
        host={showEditHostModal?.host}
        inventory={showEditHostModal?.inventory}
        cluster={cluster}
        onClose={() => setShowEditHostModal(undefined)}
        isOpen={!!showEditHostModal}
        onSave={() => setShowEditHostModal(undefined)}
      />
    </>
  );
};

export default HostsTable;
