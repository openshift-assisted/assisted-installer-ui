import * as React from 'react';
import { Host } from '../../../common';
import {
  hostnameColumn,
  roleColumn,
  countColumn,
  networkingStatusColumn,
  activeNICColumn,
  ipv4Column,
  ipv6Column,
  macAddressColumn,
} from '../../../common/components/hosts/tableUtils';
import { ActionsResolver } from '../../../common/components/hosts/AITable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { HostsTableActions } from '../hosts';
import { Cluster } from '../../api';
import HostsTable from '../hosts/HostsTable';

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
  const content = React.useMemo(
    () => [
      hostnameColumn(onEditHost),
      roleColumn(canEditRole, onEditRole),
      networkingStatusColumn(onEditHost),
      activeNICColumn(cluster),
      ipv4Column(cluster),
      ipv6Column(cluster),
      macAddressColumn(cluster),
      countColumn(cluster),
    ],
    [onEditHost, onEditRole, canEditRole, cluster],
  );

  return (
    <HostsTable
      testId="networking-host-table"
      hosts={cluster.hosts || []}
      skipDisabled={skipDisabled}
      ExpandComponent={({ obj }) => {
        return (
          <HostDetail
            host={obj}
            AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
          />
        );
      }}
      content={content}
      actionResolver={actionResolver}
      onSelect={onSelect}
      selectedIDs={selectedIDs}
    >
      {children}
    </HostsTable>
  );
};

export default NetworkConfigurationTable;
