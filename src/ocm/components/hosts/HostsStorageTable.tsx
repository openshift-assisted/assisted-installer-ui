import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  hostnameColumn,
  roleColumn,
  countColumn,
} from '../../../common/components/hosts/tableUtils';
import {
  totalStorageColumn,
  odfUsageColumn,
  numberOfDisksColumn,
} from '../../../common/components/storage/StorageUtils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  Cluster,
  Host,
  hasODFOperators,
  selectSchedulableMasters,
  isCompact,
} from '../../../common';
import { hardwareStatusColumn } from './HostsDiscoveryTable';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import StorageDetail from '../../../common/components/storage/StorageDetail';
import CommonStorageTable from '../../../common/components/storage/StorageTable';
import { HostsTableModals, useHostsTable } from './use-hosts-table';

const getExpandComponent = (onDiskRole: onDiskRoleType, canEditDisks: (host: Host) => boolean) =>
  function Expander({ obj: host }: ExpandComponentProps<Host>) {
    return (
      <StorageDetail
        key={host.id}
        host={host}
        onDiskRole={onDiskRole}
        canEditDisks={canEditDisks}
      />
    );
  };

const HostsStorageTable = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const { onEditHost, actionChecks, onDiskRole, actionResolver, ...modalProps } =
    useHostsTable(cluster);

  const content = React.useMemo(() => {
    const columns = [
      hostnameColumn(t, onEditHost, undefined, actionChecks.canEditHostname),
      roleColumn(t, undefined, undefined, selectSchedulableMasters(cluster)),
      hardwareStatusColumn(),
      totalStorageColumn,
      numberOfDisksColumn,
    ];
    if (hasODFOperators(cluster)) {
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
          <CommonStorageTable
            testId="storage-table"
            hosts={hosts}
            content={content}
            actionResolver={actionResolver}
            ExpandComponent={getExpandComponent(onDiskRole, actionChecks.canEditDisks)}
            {...paginationProps}
          />
        </StackItem>
      </Stack>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default HostsStorageTable;
