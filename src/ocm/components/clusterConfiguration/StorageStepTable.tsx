import React from 'react';
import {
  HostsNotShowingLinkProps,
  getSchedulableMasters,
  Cluster,
  Host,
  isSNO,
  OPERATOR_LABELS,
  OPERATOR_NAME_ODF,
} from '../../../common';
import {
  numberOfDisks,
  totalStorageColumn,
  roleColumn,
  hardwareStatusColumn,
  ODFUsage,
} from './StorageUtils';
import { HostsTableEmptyState } from '../../../common/components/hosts/HostsTable';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import { Stack, StackItem } from '@patternfly/react-core';
import { usePagination } from '../../../common/components/hosts/usePagination';
import StorageTable from './StorageTable';
import { AdditionalNTPSourcesDialogToggle } from '../hosts/AdditionaNTPSourceDialogToggle';
import { HostsTableModals, useHostsTable } from '../hosts/use-hosts-table';
import { StorageDetail } from './StorageDetail';
import { countColumn, hostnameColumn } from '../../../common/components/hosts/tableUtils';

const getExpandComponent = (onDiskRole: onDiskRoleType, canEditDisks: (host: Host) => boolean) => ({
  obj: host,
}: ExpandComponentProps<Host>) => (
  <StorageDetail
    key={host.id}
    host={host}
    onDiskRole={onDiskRole}
    canEditDisks={canEditDisks}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

type StorageTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

const StorageStepTable: React.FC<StorageTableProps> = ({ cluster, setDiscoveryHintModalOpen }) => {
  const {
    onEditHost,
    actionChecks,
    onDiskRole,
    actionResolver,
    onSelect,
    selectedHostIDs,
    setSelectedHostIDs,
    ...modalProps
  } = useHostsTable(cluster);
  //
  // const dispatch = useDispatch();
  // const { alerts, addAlert, removeAlert } = useAlerts();

  const isODFUsage =
    cluster.monitoredOperators &&
    cluster.monitoredOperators.some(
      (operator) => operator.name && operator.name === OPERATOR_NAME_ODF,
    );

  const content = React.useMemo(
    () =>
      [
        hostnameColumn(onEditHost, undefined, actionChecks.canEditHostname),
        roleColumn(getSchedulableMasters(cluster)),
        hardwareStatusColumn(),
        totalStorageColumn,
        numberOfDisks(),
      ].concat(isODFUsage ? [ODFUsage()].concat(countColumn(cluster)) : [countColumn(cluster)]),
    [onEditHost, actionChecks.canEditHostname, cluster],
  );

  // React.useEffect(() => {
  //   const forceRole = async () => {
  //     if (cluster.hosts && cluster.hosts.length <= 3) {
  //       try {
  //         const promises = [];
  //         for (const host of cluster.hosts) {
  //           if (host.role !== 'master') {
  //             promises.push(HostsService.updateRole(cluster.id, host.id, 'master'));
  //           }
  //         }
  //         const data = (await Promise.all(promises)).map((promise) => promise.data);
  //         data.forEach((host) => dispatch(updateHost(host)));
  //
  //         alerts
  //           .filter((alert) => alert.title === 'Failed to set role')
  //           .forEach((a) => removeAlert(a.key));
  //       } catch (error) {
  //         handleApiError(error, () => {
  //           if (!alerts.map((alert) => alert.message).includes(getErrorMessage(error))) {
  //             addAlert({ title: 'Failed to set role', message: getErrorMessage(error) });
  //           }
  //         });
  //       }
  //     }
  //   };
  //
  //   forceRole();
  // }, [dispatch, cluster.id, cluster.hosts, alerts, addAlert, removeAlert]);

  const hosts = cluster.hosts || [];
  const paginationProps = usePagination(hosts.length);

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <StorageTable
            testId="hosts-discovery-table"
            hosts={cluster.hosts || []}
            content={content}
            actionResolver={actionResolver}
            ExpandComponent={getExpandComponent(onDiskRole, actionChecks.canEditDisks)}
            onSelect={onSelect}
            selectedIDs={selectedHostIDs}
            setSelectedHostIDs={setSelectedHostIDs}
            {...paginationProps}
          >
            <HostsTableEmptyState
              isSNO={isSNO(cluster)}
              setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
            />
          </StorageTable>
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default StorageStepTable;
