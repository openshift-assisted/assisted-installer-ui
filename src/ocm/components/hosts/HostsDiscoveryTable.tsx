import React from 'react';
import { sortable } from '@patternfly/react-table';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  ChangeHostnameAction,
  selectSchedulableMasters,
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
import { ValidationsInfo } from '../../../common/types/hosts';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import HostsTableEmptyState from '../hosts/HostsTableEmptyState';
import HardwareStatus from './HardwareStatus';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';
import {
  HostsTableDetailContextProvider,
  useHostTableDetailContext,
} from './HostsTableDetailContext';

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

const ExpandHostDetail = ({ obj: host }: ExpandComponentProps<Host>) => {
  const { onDiskRole, canEditDisks } = useHostTableDetailContext();
  return (
    <HostDetail
      key={host.id}
      host={host}
      onDiskRole={onDiskRole}
      canEditDisks={canEditDisks}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

const HostsDiscoveryTable = ({ cluster }: { cluster: Cluster; skipDisabled?: boolean }) => {
  const {
    onEditHost,
    actionChecks,
    onEditRole,
    actionResolver,
    onSelect,
    onDiskRole,
    selectedHostIDs,
    setSelectedHostIDs,
    onMassChangeHostname,
    onMassDeleteHost,
    ...modalProps
  } = useHostsTable(cluster);

  const isSNOCluster = isSNO(cluster);
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [
      hostnameColumn(t, onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(t, actionChecks.canEditRole, onEditRole, selectSchedulableMasters(cluster)),
      hardwareStatusColumn(onEditHost),
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
      countColumn(cluster),
    ],
    [onEditHost, actionChecks.canEditHostname, actionChecks.canEditRole, onEditRole, cluster, t],
  );

  const hosts = cluster.hosts || [];
  const paginationProps = usePagination(hosts.length);
  const itemIDs = hosts.map((h) => h.id);

  return (
    <>
      <Stack hasGutter>
        {!isSNOCluster && (
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
          <HostsTableDetailContextProvider
            onDiskRole={onDiskRole}
            canEditDisks={actionChecks.canEditDisks}
          >
            <HostsTable
              testId="hosts-discovery-table"
              hosts={hosts}
              content={content}
              actionResolver={actionResolver}
              ExpandComponent={ExpandHostDetail}
              onSelect={isSNOCluster ? undefined : onSelect}
              selectedIDs={selectedHostIDs}
              setSelectedIDs={setSelectedHostIDs}
              {...paginationProps}
            >
              <HostsTableEmptyState isSingleNode={isSNOCluster} />
            </HostsTable>
          </HostsTableDetailContextProvider>
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default HostsDiscoveryTable;
