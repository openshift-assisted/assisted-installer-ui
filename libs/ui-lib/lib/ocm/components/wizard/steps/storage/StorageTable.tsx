import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';
import {
  countColumn,
  disksColumn,
  hostnameColumn,
  roleColumn,
  hasEnabledOperators,
  isCompact,
  selectSchedulableMasters,
  OPERATOR_NAME_ODF,
  usePagination,
  useTranslation,
  ExpandComponentProps,
  AITable,
  HostsTableDetailContextProvider,
  useHostsTableDetailContext,
  numberOfDisksColumn,
  odfUsageColumn,
  StorageDetail,
} from '../../../../../common';
import { HostsTableModals, useHostsTable, hardwareStatusColumn } from '../../../hostsTable';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { StorageAlerts } from './StorageAlerts';

export function ExpandComponent({ obj: host }: ExpandComponentProps<Host>) {
  const { onDiskRole, canEditDisks, updateDiskSkipFormatting } = useHostsTableDetailContext();
  return (
    <StorageDetail
      key={host.id}
      host={host}
      onDiskRole={onDiskRole}
      canEditDisks={canEditDisks}
      updateDiskSkipFormatting={updateDiskSkipFormatting}
    />
  );
}

export const StorageTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const {
    onEditHost,
    actionChecks,
    onDiskRole,
    actionResolver,
    updateDiskSkipFormatting,
    ...modalProps
  } = useHostsTable(cluster);
  const { wizardPerPage, setWizardPerPage } = useClusterWizardContext();

  const content = React.useMemo(() => {
    const columns = [
      hostnameColumn(t, onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(t, undefined, undefined, selectSchedulableMasters(cluster)),
      hardwareStatusColumn({}),
      disksColumn(t),
      numberOfDisksColumn,
    ];
    if (hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF)) {
      const excludeODfForMasters = !isCompact(cluster);
      columns.push(odfUsageColumn(excludeODfForMasters));
    }
    columns.push(countColumn(cluster));
    return columns;
  }, [actionChecks.canEditHostname, cluster, onEditHost, t]);

  const hosts = cluster.hosts || [];
  const paginationProps = usePagination(hosts.length, wizardPerPage, setWizardPerPage);

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <HostsTableDetailContextProvider
            canEditDisks={actionChecks.canEditDisks}
            onDiskRole={onDiskRole}
            updateDiskSkipFormatting={updateDiskSkipFormatting}
          >
            <AITable<Host>
              getDataId={(host: Host) => host.id}
              data={hosts}
              testId="storage-table"
              content={content}
              actionResolver={actionResolver}
              ExpandComponent={ExpandComponent}
              {...paginationProps}
            >
              {''}
            </AITable>
          </HostsTableDetailContextProvider>
        </StackItem>
        <StackItem>
          <StorageAlerts cluster={cluster} />
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};
