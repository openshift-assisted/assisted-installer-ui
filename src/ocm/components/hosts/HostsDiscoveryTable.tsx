import React from 'react';
import {
  ChangeHostnameAction,
  getSchedulableMasters,
  Cluster,
  Host,
  HostsTableActions,
  stringToJSON,
  isSNO,
  DeleteHostAction,
  TableToolbar,
} from '../../../common';
import { HostsTableModals, useHostsTable } from './use-hosts-table';
import {
  countColumn,
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { ExpandComponentProps, TableRow } from '../../../common/components/hosts/AITable';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';
import { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import { sortable } from '@patternfly/react-table';
import { ValidationsInfo } from '../../../common/types/hosts';
import HardwareStatus from './HardwareStatus';
import { Stack, StackItem } from '@patternfly/react-core';
import { usePagination } from '../../../common/components/hosts/usePagination';
import HostsTableEmptyState from '../hosts/HostsTableEmptyState';

export const hardwareStatusColumn = (
  onEditHostname?: HostsTableActions['onEditHost'],
): TableRow<Host> => {
  return {
    header: {
      title: 'Status',
      props: {
        id: 'col-header-hwstatus',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
      const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
      return {
        title: (
          <HardwareStatus
            host={host}
            onEditHostname={editHostname}
            validationsInfo={validationsInfo}
          />
        ),
        props: { 'data-testid': 'host-hw-status' },
        sortableValue: status,
      };
    },
  };
};

const getExpandComponent =
  (onDiskRole: onDiskRoleType, canEditDisks: (host: Host) => boolean) =>
  // eslint-disable-next-line react/display-name
  ({ obj: host }: ExpandComponentProps<Host>) =>
    (
      <HostDetail
        key={host.id}
        host={host}
        onDiskRole={onDiskRole}
        canEditDisks={canEditDisks}
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      />
    );

type HostsDiscoveryTableProps = {
  cluster: Cluster;
  isDisabled: boolean;
};

const HostsDiscoveryTable = ({ cluster, isDisabled }: HostsDiscoveryTableProps) => {
  const {
    onEditHost,
    actionChecks,
    onEditRole,
    onDiskRole,
    actionResolver,
    onSelect,
    selectedHostIDs,
    setSelectedHostIDs,
    onMassChangeHostname,
    onMassDeleteHost,
    ...modalProps
  } = useHostsTable(cluster, isDisabled);

  const isSNOCluster = isSNO(cluster);
  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(actionChecks.canEditRole, onEditRole, getSchedulableMasters(cluster)),
      hardwareStatusColumn(onEditHost),
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
      countColumn(cluster),
    ],
    [onEditHost, actionChecks.canEditHostname, actionChecks.canEditRole, onEditRole, cluster],
  );

  const hosts = cluster.hosts || [];
  const paginationProps = usePagination(hosts.length);
  const itemIDs = hosts.map((h) => h.id);
  const showBulkActions = !isDisabled && !isSNOCluster;

  return (
    <>
      <Stack hasGutter>
        {showBulkActions && (
          <StackItem>
            <TableToolbar
              selectedIDs={selectedHostIDs || []}
              itemIDs={itemIDs}
              setSelectedIDs={setSelectedHostIDs}
              actions={[
                <ChangeHostnameAction key="hostname" onChangeHostname={onMassChangeHostname} />,
                <DeleteHostAction key="delete" onDeleteHost={onMassDeleteHost} />,
              ]}
              {...paginationProps}
            />
          </StackItem>
        )}
        <StackItem>
          <HostsTable
            testId="hosts-discovery-table"
            hosts={cluster.hosts || []}
            content={content}
            actionResolver={actionResolver}
            ExpandComponent={getExpandComponent(onDiskRole, actionChecks.canEditDisks)}
            onSelect={showBulkActions ? onSelect : undefined}
            selectedIDs={selectedHostIDs}
            setSelectedIDs={setSelectedHostIDs}
            {...paginationProps}
          >
            <HostsTableEmptyState isSingleNode={isSNOCluster} />
          </HostsTable>
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default HostsDiscoveryTable;
