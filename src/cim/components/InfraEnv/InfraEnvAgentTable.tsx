import * as React from 'react';
import { AgentK8sResource, BareMetalHostK8sResource, InfraEnvK8sResource } from '../../types';
import { Host } from '../../../common/api/types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
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

export type InfraEnvAgentTableProps = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  infraEnv: InfraEnvK8sResource;
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string | React.ReactNode;
  className?: string;
  hideClusterColumn?: boolean;
};

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
