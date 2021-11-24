import * as React from 'react';
import { Host } from '../../../common/api/types';
import {
  discoveryTypeColumn,
  infraEnvStatusColumn,
  clusterColumn,
  useAgentsTable,
} from '../Agent/tableUtils';
import HostsTable, { HostsTableEmptyState } from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';
import { DiscoveryTroubleshootingModal } from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import { InfraEnvAgentTableProps } from '../ClusterDeployment/types';

const InfraEnvAgentTable: React.FC<InfraEnvAgentTableProps> = ({
  agents,
  className,
  getClusterDeploymentLink,
  bareMetalHosts,
  infraEnv,
  hideClusterColumn,
  ...actions
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [hosts, hostActions, actionResolver] = useAgentsTable(actions, {
    agents,
    bmhs: bareMetalHosts,
    infraEnv,
  });
  const content = React.useMemo(
    () =>
      [
        hostnameColumn(hostActions.onEditHost),
        discoveryTypeColumn(agents, bareMetalHosts),
        infraEnvStatusColumn({
          agents,
          bareMetalHosts,
          onEditHostname: actions.onEditHost,
          onApprove: actions.onApprove,
        }),
        (!hideClusterColumn && clusterColumn(agents, getClusterDeploymentLink)) as TableRow<Host>,
        discoveredAtColumn,
        cpuCoresColumn,
        memoryColumn,
        disksColumn,
      ].filter(Boolean),
    [agents, actions, getClusterDeploymentLink, hostActions, bareMetalHosts, hideClusterColumn],
  );
  return (
    <>
      <HostsTable
        hosts={hosts}
        content={content}
        actionResolver={actionResolver}
        className={className}
      >
        <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </HostsTable>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </>
  );
};

export default InfraEnvAgentTable;
