import * as React from 'react';
import { Cluster, selectSchedulableMasters, Host, isSNO } from '../../../common';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';
import {
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
  statusColumn,
  cpuCoresColumn,
} from '../../../common/components/hosts/tableUtils';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useHostsTable, HostsTableModals } from './use-hosts-table';
import HostsTable from '../../../common/components/hosts/HostsTable';
import HostsTableEmptyState from '../hosts/HostsTableEmptyState';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { UpdateDay2ApiVipDialogToggle } from './UpdateDay2ApiVipDialogToggle';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  HostsTableDetailContextProvider,
  useHostsTableDetailContext,
} from '../../../common/components/hosts/HostsTableDetailContext';
import { TableVariant } from '@patternfly/react-table';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';

export function ExpandComponent({ obj: host }: ExpandComponentProps<Host>) {
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
}

export interface ClusterHostsTableProps {
  cluster: Cluster;
  skipDisabled?: boolean;
}

const ClusterHostsTable = ({ cluster, skipDisabled }: ClusterHostsTableProps) => {
  const { wizardPerPage, setWizardPerPage } = useClusterWizardContext();
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
      discoveredAtColumn,
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
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
          <HostsTableEmptyState isSingleNode={isSNO(cluster)} />
        </HostsTable>
      </HostsTableDetailContextProvider>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default ClusterHostsTable;
