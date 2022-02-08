import React from 'react';
import {
  ChangeHostnameAction,
  HostsNotShowingLinkProps,
  HostToolbar,
  getSchedulableMasters,
  Cluster,
  Host,
  useAlerts,
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
import { isSNO } from '../../selectors/clusterSelectors';
import { getErrorMessage, handleApiError } from '../../api/utils';

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
  const { alerts, addAlert, removeAlert } = useAlerts();

  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(
        actionChecks.canEditRole,
        onEditRole,
        getSchedulableMasters(cluster),
        !isSNO(cluster),
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
      if (cluster.hosts && cluster.hosts.length <= 3) {
        try {
          const promises = [];
          for (const host of cluster.hosts) {
            if (host.role !== 'master') {
              promises.push(HostsService.updateRole(cluster.id, host.id, 'master'));
            }
          }
          const data = (await Promise.all(promises)).map((promise) => promise.data);
          data.forEach((host) => dispatch(updateHost(host)));

          alerts
            .filter((alert) => alert.title == 'Failed to set role')
            .forEach((a) => removeAlert(a.key));
        } catch (error) {
          handleApiError(error, () => {
            if (!alerts.map((alert) => alert.message).includes(getErrorMessage(error))) {
              addAlert({ title: 'Failed to set role', message: getErrorMessage(error) });
            }
          });
        }
      }
    };

    forceRole();
  }, [dispatch, cluster.id, cluster.hosts, alerts, addAlert, removeAlert]);

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
