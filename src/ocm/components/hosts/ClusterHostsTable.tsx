import * as React from 'react';
import { ClusterHostsTableProps, getSchedulableMasters, Host } from '../../../common';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';
import {
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
  statusColumn,
  cpuCoresColumn,
  countColumn,
} from '../../../common/components/hosts/tableUtils';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { useHostsTable, HostsTableModals } from './use-hosts-table';
import HostsTable, { HostsTableEmptyState } from '../../../common/components/hosts/HostsTable';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { UpdateDay2ApiVipDialogToggle } from './UpdateDay2ApiVipDialogToggle';

const ExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => {
  return (
    <HostDetail
      host={obj}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      hideNTPStatus
    />
  );
};

const ClusterHostsTable: React.FC<ClusterHostsTableProps> = ({
  cluster,
  setDiscoveryHintModalOpen,
  skipDisabled,
}) => {
  const { onEditHost, actionChecks, onEditRole, actionResolver, ...modalProps } = useHostsTable(
    cluster,
  );

  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(actionChecks.canEditRole, onEditRole, getSchedulableMasters(cluster)),
      statusColumn(AdditionalNTPSourcesDialogToggle, onEditHost, UpdateDay2ApiVipDialogToggle),
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
      countColumn(cluster),
    ],
    [onEditHost, actionChecks, onEditRole, cluster],
  );

  return (
    <>
      <HostsTable
        hosts={cluster.hosts || []}
        skipDisabled={skipDisabled}
        ExpandComponent={ExpandComponent}
        content={content}
        actionResolver={actionResolver}
      >
        <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </HostsTable>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default ClusterHostsTable;
