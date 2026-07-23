import React from 'react';
import { useSelector } from 'react-redux';
import { Stack, StackItem } from '@patternfly/react-core';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';
import {
  ChangeHostnameAction,
  selectSchedulableMasters,
  isSNO,
  DeleteHostAction,
  TableToolbar,
  countColumn,
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
  HostsTable,
  HostDetail,
  ExpandComponentProps,
  usePagination,
  useTranslation,
  HostsTableEmptyState,
} from '../../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../../store';
import {
  HostsTableModals,
  useHostsTable,
  AdditionalNTPSourcesDialogToggle,
  hardwareStatusColumn,
  HostsDiscoveryTroubleshootingInfoLinkWithModal,
} from '../../../hostsTable';
import { useClusterWizardContext } from '../../clusterWizardContext';

const HostRowDetailExpand = ({ obj: host }: ExpandComponentProps<Host>) => (
  <HostDetail
    key={host.id}
    host={host}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

type HostsDiscoveryTableProps = {
  cluster: Cluster;
  hosts: Host[];
};

export const HostsDiscoveryTable = ({ cluster, hosts }: HostsDiscoveryTableProps) => {
  const {
    onEditHost,
    actionChecks,
    onEditRole,
    actionResolver,
    onSelect,
    selectedHostIDs,
    setSelectedHostIDs,
    onMassChangeHostname,
    onMassDeleteHost,
    ...modalProps
  } = useHostsTable(cluster);

  const { wizardPerPage, setWizardPerPage } = useClusterWizardContext();

  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const isSNOCluster = isSNO(cluster);
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [
      hostnameColumn(t, onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(
        t,
        actionChecks.canEditRole,
        onEditRole,
        selectSchedulableMasters(cluster),
        cluster.kind,
      ),
      hardwareStatusColumn({
        onEditHostname: onEditHost,
        openshiftVersion: cluster.openshiftVersion,
      }),
      discoveredAtColumn(t),
      cpuCoresColumn(t),
      memoryColumn(t),
      disksColumn(t),
      countColumn(cluster),
    ],
    [t, onEditHost, actionChecks.canEditHostname, actionChecks.canEditRole, onEditRole, cluster],
  );

  const paginationProps = usePagination(hosts.length, wizardPerPage, setWizardPerPage);
  const itemIDs = hosts.map((h) => h.id);
  const showBulkActions = !(isViewerMode || isSNOCluster);

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
            hosts={hosts}
            content={content}
            actionResolver={actionResolver}
            ExpandComponent={HostRowDetailExpand}
            onSelect={showBulkActions ? onSelect : undefined}
            selectedIDs={selectedHostIDs}
            setSelectedIDs={setSelectedHostIDs}
            {...paginationProps}
          >
            <HostsTableEmptyState
              isSNO={isSNOCluster}
              secondaryActions={[
                <HostsDiscoveryTroubleshootingInfoLinkWithModal key={'hosts-not-showing'} />,
              ]}
            />
          </HostsTable>
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};
