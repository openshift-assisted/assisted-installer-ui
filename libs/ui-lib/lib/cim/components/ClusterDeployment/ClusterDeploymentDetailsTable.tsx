import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
  DefaultExpandComponent,
  HostsTable,
  usePagination,
  useTranslation,
  EmptyState,
} from '../../../common';
import { agentStatus } from '../helpers/agentStatus';
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import { useAgentsTable, infraEnvColumn, agentStatusColumn } from '../Agent';

export const getAgentId = (agent: AgentK8sResource) => agent.metadata?.uid as string;

export const AgentTableEmptyState = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={ConnectedIcon}
      title={t('ai:Waiting for hosts...')}
      content={t('ai:Hosts may take a few minutes to appear here after booting.')}
    />
  );
};

export type ClusterDeploymentDetailsTableProps = {
  agents: AgentK8sResource[];
  agentClusterInstall: AgentClusterInstallK8sResource;
};

const ClusterDeploymentDetailsTable: React.FC<ClusterDeploymentDetailsTableProps> = ({
  agents,
  agentClusterInstall,
}) => {
  const agentClusterInstalls = React.useMemo(() => [agentClusterInstall], [agentClusterInstall]);
  const [hosts, , actionResolver] = useAgentsTable({ agents, agentClusterInstalls });
  const { t } = useTranslation();
  const agentStatuses = agentStatus(t);
  const content = React.useMemo(
    () => [
      hostnameColumn(t),
      roleColumn(t),
      agentStatusColumn({
        agents,
        agentStatuses,
        t,
      }),
      infraEnvColumn(agents, t),
      cpuCoresColumn(t),
      memoryColumn(t),
      disksColumn(t),
    ],
    [agentStatuses, agents, t],
  );

  const paginationProps = usePagination(agents.length);
  return (
    <HostsTable
      hosts={hosts}
      content={content}
      actionResolver={actionResolver}
      ExpandComponent={DefaultExpandComponent}
      {...paginationProps}
    >
      <AgentTableEmptyState />
    </HostsTable>
  );
};

export default ClusterDeploymentDetailsTable;
