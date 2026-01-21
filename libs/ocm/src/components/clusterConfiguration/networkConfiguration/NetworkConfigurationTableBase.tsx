import * as React from 'react';
import { HostsTableActions, selectSchedulableMasters } from '@openshift-assisted/common';
import NetworkingStatus from '../../hosts/NetworkingStatus';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import {
  hostnameColumn,
  roleColumn,
  activeNICColumn,
  ipv4Column,
  ipv6Column,
  macAddressColumn,
  countColumn,
} from '@openshift-assisted/common/components/hosts/tableUtils';
import { ActionsResolver, TableRow } from '@openshift-assisted/common/components/hosts/AITable';
import { usePagination } from '@openshift-assisted/common/components/hosts/usePagination';
import { HostDetail } from '@openshift-assisted/common/components/hosts/HostRowDetail';
import HostsTable from '@openshift-assisted/common/components/hosts/HostsTable';
import { ValidationsInfo } from '@openshift-assisted/common/types/hosts';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';
import { stringToJSON } from '@openshift-assisted/common/utils';
import { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';

export const networkingStatusColumn = (
  onEditHostname?: HostsTableActions['onEditHost'],
): TableRow<Host> => ({
  header: {
    title: 'Status',
    sort: true,
  },
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
      props: { 'data-testid': 'host-status' },
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
  const { wizardPerPage, setWizardPerPage } = useClusterWizardContext();
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [
      hostnameColumn(t, onEditHost, undefined, canEditHostname),
      roleColumn(t, canEditRole, onEditRole, selectSchedulableMasters(cluster)),
      networkingStatusColumn(onEditHost),
      activeNICColumn(cluster, t),
      ipv4Column(cluster),
      ipv6Column(cluster),
      macAddressColumn(cluster),
      countColumn(cluster),
    ],
    [t, onEditHost, onEditRole, canEditHostname, canEditRole, cluster],
  );

  const hosts = cluster.hosts || [];

  const paginationProps = usePagination(hosts.length, wizardPerPage, setWizardPerPage);

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
