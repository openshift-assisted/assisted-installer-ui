import React from 'react';
import {
  ChangeHostnameAction,
  HostsNotShowingLinkProps,
  HostToolbar,
  getSchedulableMasters,
  Cluster,
  Host,
} from '../../../common';
import { HostsTableModals, useHostsTable } from './use-hosts-table';
import {
  countColumn,
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hardwareStatusColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import HostsTable, { HostsTableEmptyState } from '../../../common/components/hosts/HostsTable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';
import { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import { Stack, StackItem } from '@patternfly/react-core';

const getExpandComponent = (onDiskRole: onDiskRoleType, canEditDisks: (host: Host) => boolean) => ({
  obj: host,
}: ExpandComponentProps<Host>) => (
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
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

const HostsDiscoveryTable: React.FC<HostsDiscoveryTableProps> = ({
  cluster,
  setDiscoveryHintModalOpen,
}) => {
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
    ...modalProps
  } = useHostsTable(cluster);

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

  const hostIDs = cluster.hosts?.map((h) => h.id) || [];

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <HostToolbar
            selectedHostIDs={selectedHostIDs}
            hostIDs={hostIDs}
            onSelectAll={() => setSelectedHostIDs(hostIDs)}
            onSelectNone={() => setSelectedHostIDs([])}
            actionItems={[
              <ChangeHostnameAction key="hostname" onChangeHostname={onMassChangeHostname} />,
            ]}
          />
        </StackItem>
        <StackItem>
          <HostsTable
            testId="hosts-discovery-table"
            hosts={cluster.hosts || []}
            content={content}
            actionResolver={actionResolver}
            ExpandComponent={getExpandComponent(onDiskRole, actionChecks.canEditDisks)}
            onSelect={onSelect}
            selectedIDs={selectedHostIDs}
            setSelectedHostIDs={setSelectedHostIDs}
          >
            <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
          </HostsTable>
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default HostsDiscoveryTable;
