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
import { getColSpanRow, rowSorter, getDateTimeCell } from '../ui/table/utils';
import { Host, Cluster, Inventory, ClusterStatusEnum } from '../../api/types';
import {
  enableClusterHost,
  disableClusterHost,
  deleteClusterHost,
  resetClusterHost,
} from '../../api/clusters';
import { EventsModal } from '../ui/eventsModal';
import { DiscoveryImageModalButton } from '../clusterConfiguration/discoveryImageModal';
import HostStatus from './HostStatus';
import { HostDetail } from './HostRowDetail';
import {
  forceReload,
  updateCluster,
  updateHost,
} from '../../features/clusters/currentClusterSlice';
import { handleApiError, stringToJSON, getErrorMessage } from '../../api/utils';
import sortable from '../ui/table/sortable';
import { DASH } from '../constants';
import { AlertsContext } from '../AlertsContextProvider';
import {
  HostsNotShowingLink,
  HostsNotShowingLinkProps,
} from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import { ValidationsInfo } from '../../types/hosts';
import { installHost } from '../../api';
import { getHostRowHardwareInfo } from './hardwareInfo';
import RoleCell from './RoleCell';
import DeleteHostModal from './DeleteHostModal';
import ResetHostModal from './ResetHostModal';
import {
  canEnable,
  canDisable,
  canDelete,
  canEditHost,
  getHostRole,
  canDownloadHostLogs,
  downloadHostInstallationLogs,
  canReset,
  getHostname,
  canInstallHost,
} from './utils';
import EditHostModal from './EditHostModal';
import Hostname from './Hostname';
import HostsCount from './HostsCount';
import HostPropertyValidationPopover from './HostPropertyValidationPopover';
import { HostDialogsContextProvider, useHostDialogsContext } from './HostDialogsContext';
import { AdditionalNTPSourcesDialog } from './AdditionalNTPSourcesDialog';

import './HostsTable.css';

type HostsTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

type OpenRows = {
  [id: string]: boolean;
};

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
          title: <HostStatus host={host} cluster={cluster} validationsInfo={validationsInfo} />,
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

const HostsTableEmptyState: React.FC<{
  cluster: Cluster;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
}> = ({ cluster, setDiscoveryHintModalOpen }) => (
  <EmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Hosts may take a few minutes to appear here after booting."
    primaryAction={<DiscoveryImageModalButton cluster={cluster} idPrefix="host-table-empty" />}
    secondaryActions={
      setDiscoveryHintModalOpen && [
        <HostsNotShowingLink
          key="hosts-not-showing"
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />,
      ]
    }
  />
);

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.key;
const isHostShown = (skipDisabled: boolean) => (host: Host) =>
  !skipDisabled || host.status != 'disabled';

const HostsTable: React.FC<HostsTableProps> = ({
  cluster,
  skipDisabled = false,
  setDiscoveryHintModalOpen,
}) => {
  const { addAlert } = React.useContext(AlertsContext);
  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
    additionalNTPSourcesDialog,
  } = useHostDialogsContext();

  const [openRows, setOpenRows] = React.useState({} as OpenRows);
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
    return getColSpanRow(
      <HostsTableEmptyState
        cluster={cluster}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />,
      columns.length,
    );
  }, [hostRows, cluster, columns, setDiscoveryHintModalOpen]);

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
        dispatch(updateCluster(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: `Failed to enable host ${hostId}`, message: getErrorMessage(e) }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
  );

  const onInstallHost = React.useCallback(
    async (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const hostId = rowData.host.id;
      try {
        const { data } = await installHost(cluster.id, hostId);
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
        dispatch(updateCluster(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: `Failed to disable host ${hostId}`, message: getErrorMessage(e) }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
  );
  const onHostReset = React.useCallback(
    async (hostId) => {
      try {
        const { data } = await resetClusterHost(cluster.id, hostId);
        dispatch(updateHost(data));
      } catch (e) {
        return handleApiError(e, () =>
          addAlert({ title: `Failed to reset host ${hostId}`, message: getErrorMessage(e) }),
        );
      }
    },
    [cluster.id, dispatch, addAlert],
  );

  const onViewHostEvents = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      const host = rowData.host;
      const { id, requestedHostname } = host;
      const hostname = requestedHostname || rowData.inventory?.hostname || id;
      eventsDialog.open({ hostId: id, hostname });
    },
    [eventsDialog],
  );

  const onEditHost = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
      editHostDialog.open({ host: rowData.host, inventory: rowData.inventory });
    },
    [editHostDialog],
  );

  const onDownloadHostLogs = React.useCallback(
    (event: React.MouseEvent, rowIndex: number, rowData: IRowData) =>
      downloadHostInstallationLogs(addAlert, rowData.host),
    [addAlert],
  );

  const actionResolver = React.useCallback(
    (rowData: IRowData) => {
      const host: Host | undefined = rowData.host;
      const clusterStatus: ClusterStatusEnum = rowData.clusterStatus;
      const hostname = rowData.host?.requestedHostname || rowData.inventory?.hostname;

      if (!host) {
        // I.e. row with detail
        return [];
      }

      const actions = [];

      if (canInstallHost(cluster, host.status)) {
        actions.push({
          title: 'Install host',
          id: `button-install-host-${hostname}`,
          onClick: onInstallHost,
        });
      }
      if (canEditHost(clusterStatus, host.status)) {
        actions.push({
          title: 'Edit host',
          id: `button-edit-host-${hostname}`, // id is everchanging, not ideal for tests
          onClick: onEditHost,
        });
      }
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
      if (canReset(clusterStatus, host.status)) {
        actions.push({
          title: 'Reset host',
          id: `button-reset-host-${hostname}`,
          onClick: () => {
            resetHostDialog.open({ hostId: host.id, hostname });
          },
        });
      }
      actions.push({
        title: 'View host events',
        id: `button-view-host-events-${hostname}`,
        onClick: onViewHostEvents,
      });
      if (canDownloadHostLogs(host)) {
        actions.push({
          title: 'Download host logs',
          id: `button-download-host-installation-logs-${hostname}`,
          onClick: onDownloadHostLogs,
        });
      }
      if (canDelete(clusterStatus, host.status)) {
        actions.push({
          title: 'Delete host',
          id: `button-delete-host-${hostname}`,
          onClick: () => {
            deleteHostDialog.open({ hostId: host.id, hostname });
          },
        });
      }

      return actions;
    },
    [
      cluster,
      onHostEnable,
      onHostDisable,
      onViewHostEvents,
      onEditHost,
      onDownloadHostLogs,
      onInstallHost,
      deleteHostDialog,
      resetHostDialog,
    ],
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
        title={`Host Events${eventsDialog.isOpen ? `: ${eventsDialog.data?.hostname}` : ''}`}
        entityKind="host"
        cluster={cluster}
        hostId={eventsDialog.data?.hostId}
        onClose={() => eventsDialog.close()}
        isOpen={eventsDialog.isOpen}
      />
      <ResetHostModal
        hostname={resetHostDialog.data?.hostname}
        onClose={() => resetHostDialog.close()}
        isOpen={resetHostDialog.isOpen}
        onReset={() => {
          onHostReset(resetHostDialog.data?.hostId);
          resetHostDialog.close();
        }}
      />
      <DeleteHostModal
        hostname={deleteHostDialog.data?.hostname}
        onClose={() => deleteHostDialog.close()}
        isOpen={deleteHostDialog.isOpen}
        onDelete={() => {
          onDeleteHost(deleteHostDialog.data?.hostId);
          deleteHostDialog.close();
        }}
      />
      {editHostDialog.isOpen && <>Hey, edit Host modal should be now open!</>}
      <EditHostModal
        host={editHostDialog.data?.host}
        inventory={editHostDialog.data?.inventory}
        cluster={cluster}
        onClose={() => editHostDialog.close()}
        isOpen={editHostDialog.isOpen}
        onSave={() => editHostDialog.close()}
      />
      <AdditionalNTPSourcesDialog
        cluster={cluster}
        isOpen={additionalNTPSourcesDialog.isOpen}
        onClose={() => additionalNTPSourcesDialog.close()}
      />
    </>
  );
};

const Wrapper: React.FC<HostsTableProps> = (props) => (
  <HostDialogsContextProvider>
    <HostsTable {...props} />
  </HostDialogsContextProvider>
);

export default Wrapper;
