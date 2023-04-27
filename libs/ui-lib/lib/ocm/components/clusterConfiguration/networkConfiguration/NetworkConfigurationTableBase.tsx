import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import {
  Cluster,
  Host,
  HostsTableActions,
  selectSchedulableMasters,
  stringToJSON,
} from '../../../../common';
import NetworkingStatus from '../../hosts/NetworkingStatus';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import {
  hostnameColumn,
  roleColumn,
  activeNICColumn,
  ipv4Column,
  ipv6Column,
  macAddressColumn,
  countColumn,
} from '../../../../common/components/hosts/tableUtils';
import { ActionsResolver, TableRow } from '../../../../common/components/hosts/AITable';
import { usePagination } from '../../../../common/components/hosts/usePagination';
import { HostDetail } from '../../../../common/components/hosts/HostRowDetail';
import HostsTable from '../../../../common/components/hosts/HostsTable';
import { ValidationsInfo } from '../../../../common/types/hosts';

export const networkingStatusColumn = (
  onEditHostname?: HostsTableActions['onEditHost'],
): TableRow<Host> => ({
  header: { title: 'Status', transforms: [sortable] },
  cell: (host) => {
    const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
    const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
    return {
      title: (
        <NetworkingStatus
          host={host}
          onEditHostname={editHostname}
          validationsInfo={validationsInfo}
        />
      ),
      props: { 'data-testid': 'nic-status' },
      sortableValue: status,
    };
  },
});

type NetworkConfigurationTableProps = {
  cluster: Cluster;
  AdditionalNTPSourcesDialogToggleComponent: React.FC;
  actionResolver: ActionsResolver<Host>;
  children: React.ReactNode;
  onEditHost?: HostsTableActions['onEditHost'];
  onEditRole?: HostsTableActions['onEditRole'];
  canEditRole?: HostsTableActions['canEditRole'];
  canEditHostname?: HostsTableActions['canEditHostname'];
  onSelect?: (obj: Host, isSelected: boolean) => void;
  selectedIDs?: string[];
};

const NetworkConfigurationTableBase = ({
  cluster,
  AdditionalNTPSourcesDialogToggleComponent,
  onEditHost,
  onEditRole,
  canEditRole,
  canEditHostname,
  actionResolver,
  children,
  onSelect,
  selectedIDs,
}: NetworkConfigurationTableProps) => {
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [
      hostnameColumn(t, onEditHost, undefined, canEditHostname),
      roleColumn(t, canEditRole, onEditRole, selectSchedulableMasters(cluster)),
      networkingStatusColumn(onEditHost),
      activeNICColumn(cluster),
      ipv4Column(cluster),
      ipv6Column(cluster),
      macAddressColumn(cluster),
      countColumn(cluster),
    ],
    [t, onEditHost, onEditRole, canEditHostname, canEditRole, cluster],
  );

  const hosts = cluster.hosts || [];

  const paginationProps = usePagination(hosts.length);

  const ExpandComponent = React.useCallback(
    ({ obj }: { obj: Host }) => {
      return (
        <HostDetail
          host={obj}
          AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
        />
      );
    },
    [AdditionalNTPSourcesDialogToggleComponent],
  );

  return (
    <HostsTable
      testId="networking-host-table"
      hosts={hosts}
      ExpandComponent={ExpandComponent}
      content={content}
      actionResolver={actionResolver}
      onSelect={onSelect}
      selectedIDs={selectedIDs}
      {...paginationProps}
    >
      {children}
    </HostsTable>
  );
};

export default NetworkConfigurationTableBase;
