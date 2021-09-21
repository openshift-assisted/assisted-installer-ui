import React from 'react';
import { Cluster, HostsNotShowingLinkProps } from '../../../common';
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

type HostsDiscoveryTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

const HostsDiscoveryTable: React.FC<HostsDiscoveryTableProps> = ({
  cluster,
  setDiscoveryHintModalOpen,
}) => {
  const { onEditHost, actionChecks, onEditRole, actionResolver, ...modalProps } = useHostsTable(
    cluster,
  );

  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost),
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
      >
        <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </HostsTable>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default HostsDiscoveryTable;
