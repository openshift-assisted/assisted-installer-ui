import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import { Host } from '../../api';
import {
  hostnameColumn,
  roleColumn,
  countColumn,
  activeNICColumn,
  ipv4Column,
  ipv6Column,
  macAddressColumn,
} from '../hosts/tableUtils';
import { ActionsResolver, TableRow } from '../hosts/AITable';
import { usePagination } from '../hosts/usePagination';
import { HostDetail } from '../hosts/HostRowDetail';
import { HostsTableActions } from '../hosts';
import { Cluster, stringToJSON } from '../../api';
import HostsTable from '../hosts/HostsTable';
import { ValidationsInfo } from '../../types/hosts';
import NetworkingStatus from '../../../ocm/components/hosts/NetworkingStatus';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { selectSchedulableMasters } from '../../selectors';

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
  skipDisabled?: boolean;
  AdditionalNTPSourcesDialogToggleComponent: React.FC;
  actionResolver: ActionsResolver<Host>;
  children: React.ReactNode;
  onEditHost?: HostsTableActions['onEditHost'];
  onEditRole?: HostsTableActions['onEditRole'];
  canEditRole?: HostsTableActions['canEditRole'];
  onSelect?: (obj: Host, isSelected: boolean) => void;
  selectedIDs?: string[];
};

const NetworkConfigurationTable: React.FC<NetworkConfigurationTableProps> = ({
  cluster,
  skipDisabled,
  AdditionalNTPSourcesDialogToggleComponent,
  onEditHost,
  onEditRole,
  canEditRole,
  actionResolver,
  children,
  onSelect,
  selectedIDs,
}) => {
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [
      hostnameColumn(t, onEditHost),
      roleColumn(t, canEditRole, onEditRole, selectSchedulableMasters(cluster)),
      networkingStatusColumn(onEditHost),
      activeNICColumn(cluster),
      ipv4Column(cluster),
      ipv6Column(cluster),
      macAddressColumn(cluster),
      countColumn(cluster),
    ],
    [onEditHost, onEditRole, canEditRole, cluster, t],
  );

  const hosts = cluster.hosts || [];

  const paginationProps = usePagination(hosts.length);

  const ExpandComponent = React.useCallback(
    ({ obj }) => {
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
      skipDisabled={skipDisabled}
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

export default NetworkConfigurationTable;
