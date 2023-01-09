import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  countColumn,
  disksColumn,
  hostnameColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import {
  numberOfDisksColumn,
  odfUsageColumn,
} from '../../../common/components/storage/StorageUtils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  Cluster,
  Host,
  hasEnabledOperators,
  isCompact,
  selectSchedulableMasters,
  OPERATOR_NAME_ODF,
} from '../../../common';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import CommonStorageTable from '../../../common/components/storage/StorageTable';
import StorageDetail from '../../../common/components/storage/StorageDetail';
import StorageAlerts from './StorageAlerts';
import { HostsTableModals, useHostsTable } from './use-hosts-table';
import {
  HostsTableDetailContextProvider,
  useHostsTableDetailContext,
} from '../../../common/components/hosts/HostsTableDetailContext';
import { hardwareStatusColumn } from './HardwareStatus';

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

const HostsStorageTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const {
    onEditHost,
    actionChecks,
    onDiskRole,
    actionResolver,
    updateDiskSkipFormatting,
    ...modalProps
  } = useHostsTable(cluster);

  const content = React.useMemo(() => {
    const columns = [
      hostnameColumn(t, onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(t, undefined, undefined, selectSchedulableMasters(cluster)),
      hardwareStatusColumn({}),
      disksColumn,
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
  const paginationProps = usePagination(hosts.length);

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <HostsTableDetailContextProvider
            canEditDisks={actionChecks.canEditDisks}
            onDiskRole={onDiskRole}
            updateDiskSkipFormatting={updateDiskSkipFormatting}
          >
            <CommonStorageTable
              testId="storage-table"
              hosts={hosts}
              content={content}
              actionResolver={actionResolver}
              ExpandComponent={ExpandComponent}
              {...paginationProps}
            />
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

export default HostsStorageTable;
