import React from 'react';
import { HostsNotShowingLinkProps } from '../../../common/components/clusterConfiguration/DiscoveryTroubleshootingModal';
import { Cluster, Host } from '../../../common/api/types';
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
    ...modalProps
  } = useHostsTable(cluster);

  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost, undefined, !actionChecks.canEditHostname()),
      roleColumn(actionChecks.canEditRole, onEditRole),
      hardwareStatusColumn(onEditHost),
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
      countColumn(cluster),
    ],
    [onEditHost, onEditRole, actionChecks.canEditRole, cluster],
  );

  return (
    <>
      <HostsTable
        testId="hosts-discovery-table"
        hosts={cluster.hosts || []}
        content={content}
        actionResolver={actionResolver}
        ExpandComponent={getExpandComponent(onDiskRole, actionChecks.canEditDisks)}
      >
        <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </HostsTable>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default HostsDiscoveryTable;
