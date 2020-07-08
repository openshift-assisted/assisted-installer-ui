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

import './HostsTable.css';

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
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
];

const hostToHostTableRow = (openRows: OpenRows, clusterStatus: Cluster['status']) => (
  host: Host,
): IRow => {
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
          title: <RoleCell host={host} clusterStatus={clusterStatus} />,
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
      extraData: host,
      inventory,
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
  const { addAlert } = React.useContext(AlertsContext);
  const [showEventsModal, setShowEventsModal] = React.useState<Host['id']>('');
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
          .map(hostToHostTableRow(openRows, cluster.status))
          .sort(rowSorter(sortBy, (row: IRow, index = 1) => row[0].cells[index - 1]))
          .map((row: IRow, index: number) => {
            row[1].parent = index * 2;
            return row;
          }),
      ),
    [cluster.hosts, cluster.status, openRows, sortBy],
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
      const hostId = rowData.extraData.id;
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
      const hostId = rowData.extraData.id;
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
      const hostId = rowData.extraData.id;
      setShowEventsModal(hostId);
    },
    [],
  );

  const actionResolver = React.useCallback(
    (rowData: IRowData) => {
      const host: Host = rowData.extraData;
      const hostname = rowData.inventory?.hostname;

      if (!host) {
        // I.e. row with detail
        return [];
      }

      const actions = [];
      if (host.status === 'disabled') {
        actions.push({
          title: 'Enable in cluster',
          id: `button-enable-in-cluster-${hostname}`,
          onClick: onHostEnable,
        });
      }
      if (['discovering', 'disconnected', 'known', 'insufficient'].includes(host.status)) {
        actions.push({
          title: 'Disable in cluster',
          id: `button-disable-in-cluster-${hostname}`,
          onClick: onHostDisable,
        });
      }
      actions.push({
        title: 'View Host Events History',
        id: `button-view-host-events-${hostname}`,
        onClick: onViewHostEvents,
      });
      if (!['installing', 'installing-in-progress', 'error', 'installed'].includes(host.status)) {
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

  const getHostInventory = (hostId: Host['id']): Inventory =>
    hostRows.find((hostRow) => hostRow.extraData?.id === hostId)?.inventory;

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
        title={`Events for the ${
          getHostInventory(showEventsModal)?.hostname || showEventsModal
        } host`}
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
    </>
  );
};

export default HostsTable;
