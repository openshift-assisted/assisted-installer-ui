import React from 'react';
import {
  ChangeHostnameAction,
  HostsNotShowingLinkProps,
  HostToolbar,
  getSchedulableMasters,
  Cluster,
  Host,
  isSingleNodeCluster,
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
import { HostsService } from '../../services';
import { updateHost } from '../../reducers/clusters';
import { useDispatch } from 'react-redux';

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

  const dispatch = useDispatch();

  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(
        actionChecks.canEditRole,
        onEditRole,
        getSchedulableMasters(cluster),
        !isSingleNodeCluster(cluster),
      ),
      hardwareStatusColumn(onEditHost),
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
      countColumn(cluster),
    ],
    [onEditHost, actionChecks.canEditHostname, actionChecks.canEditRole, onEditRole, cluster],
  );

  React.useEffect(() => {
    const forceRole = async () => {
      cluster.hosts?.forEach(async (host) => {
        if (host.role !== 'master') {
          const { data } = await HostsService.updateRole(cluster.id, host.id, 'master');
          dispatch(updateHost(data));
        }
      });
    };
    if (cluster.hosts && cluster.hosts?.length <= 3) {
      forceRole();
    }
  }, [dispatch, cluster.id, cluster.hosts]);

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
