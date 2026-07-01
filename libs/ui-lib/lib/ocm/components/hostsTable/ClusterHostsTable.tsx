import * as React from 'react';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';
import { TableVariant } from '@patternfly/react-table';
import {
  ExpandComponentProps,
  useHostsTableDetailContext,
  HostDetail,
  hostnameColumn,
  roleColumn,
  selectSchedulableMasters,
  statusColumn,
  discoveredAtColumn,
  cpuCoresColumn,
  memoryColumn,
  disksColumn,
  usePagination,
  HostsTableDetailContextProvider,
  HostsTable,
  HostsTableEmptyState,
  isSNO,
  useTranslation,
} from '../../../common';
import { ClusterWizardContext } from '../wizard';
import {
  AdditionalNTPSourcesDialogToggle,
  HostsDiscoveryTroubleshootingInfoLinkWithModal,
  UpdateDay2ApiVipDialogToggle,
} from './components';
import { HostsTableModals } from './modals';
import { useHostsTable } from './use-hosts-table';

export const ExpandComponent = ({ obj: host }: ExpandComponentProps<Host>) => {
  const { onDiskRole, canEditDisks, updateDiskSkipFormatting } = useHostsTableDetailContext();
  return (
    <HostDetail
      host={host}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      hideNTPStatus
      onDiskRole={onDiskRole}
      canEditDisks={canEditDisks}
      updateDiskSkipFormatting={updateDiskSkipFormatting}
    />
  );
};

export interface ClusterHostsTableProps {
  cluster: Cluster;
  skipDisabled?: boolean;
}

export const ClusterHostsTable = ({ cluster, skipDisabled }: ClusterHostsTableProps) => {
  const { wizardPerPage, setWizardPerPage } = React.useContext(ClusterWizardContext) || {};
  const {
    onEditHost,
    onEditRole,
    actionChecks,
    onDiskRole,
    actionResolver,
    updateDiskSkipFormatting,
    ...modalProps
  } = useHostsTable(cluster);
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
      statusColumn(
        t,
        cluster.status,
        AdditionalNTPSourcesDialogToggle,
        onEditHost,
        UpdateDay2ApiVipDialogToggle,
      ),
      discoveredAtColumn(t),
      cpuCoresColumn(t),
      memoryColumn(t),
      disksColumn(t),
    ],
    [t, onEditHost, actionChecks, onEditRole, cluster],
  );

  const hosts = cluster.hosts || [];
  const paginationProps = usePagination(hosts.length, wizardPerPage, setWizardPerPage);

  return (
    <>
      <HostsTableDetailContextProvider
        canEditDisks={actionChecks.canEditDisks}
        onDiskRole={onDiskRole}
        updateDiskSkipFormatting={updateDiskSkipFormatting}
      >
        <HostsTable
          hosts={hosts}
          skipDisabled={skipDisabled}
          ExpandComponent={ExpandComponent}
          content={content}
          actionResolver={actionResolver}
          variant={TableVariant.compact}
          {...paginationProps}
        >
          <HostsTableEmptyState
            isSNO={isSNO(cluster)}
            secondaryActions={[
              <HostsDiscoveryTroubleshootingInfoLinkWithModal key={'hosts-not-showing'} />,
            ]}
          />
        </HostsTable>
      </HostsTableDetailContextProvider>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};
