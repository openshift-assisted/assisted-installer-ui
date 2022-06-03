import * as React from 'react';
import { Cluster, getSchedulableMasters, Host, isSNO } from '../../../common';
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
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useHostsTable, HostsTableModals } from './use-hosts-table';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { UpdateDay2ApiVipDialogToggle } from './UpdateDay2ApiVipDialogToggle';
import HostsTableEmptyState from '../hosts/HostsTableEmptyState';
import useClusterPermissions from '../../hooks/useClusterPermissions';

const ExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => {
  return (
    <HostDetail
      host={obj}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      hideNTPStatus
    />
  );
};

export interface ClusterHostsTableProps {
  cluster: Cluster;
  skipDisabled?: boolean;
}

const ClusterHostsTable = ({ cluster, skipDisabled }: ClusterHostsTableProps) => {
  const { isViewerMode } = useClusterPermissions();
  const { onEditHost, actionChecks, onEditRole, actionResolver, ...modalProps } = useHostsTable(
    cluster,
    isViewerMode,
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

  const hosts = cluster.hosts || [];
  const paginationProps = usePagination(hosts.length);

  return (
    <>
      <HostsTable
        hosts={hosts}
        skipDisabled={skipDisabled}
        ExpandComponent={ExpandComponent}
        content={content}
        actionResolver={actionResolver}
        {...paginationProps}
      >
        <HostsTableEmptyState isSingleNode={isSNO(cluster)} />
      </HostsTable>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default ClusterHostsTable;
