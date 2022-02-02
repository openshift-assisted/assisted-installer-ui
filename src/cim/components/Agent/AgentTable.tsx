import * as React from 'react';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { ConnectedIcon } from '@patternfly/react-icons';
import { infraEnvColumn, agentStatusColumn, useAgentsTable } from './tableUtils';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import HostsTable, { DefaultExpandComponent } from '../../../common/components/hosts/HostsTable';
import { usePagination } from '../../../common/components/hosts/usePagination';

export const getAgentId = (agent: AgentK8sResource) => agent.metadata?.uid as string;

export const AgentTableEmptyState = () => (
  <DefaultEmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Hosts may take a few minutes to appear here after booting."
  />
);

export type AgentTableProps = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  className?: string;
};

const AgentTable: React.FC<AgentTableProps> = ({ agents, className, ...actions }) => {
  const [hosts, hostActions, actionResolver] = useAgentsTable({ agents }, actions);
  const content = React.useMemo(
    () => [
      hostnameColumn(hostActions.onEditHost),
      roleColumn(hostActions.canEditRole, hostActions.onEditRole),
      agentStatusColumn({
        agents,
        onEditHostname: actions.onEditHost,
        onApprove: actions.onApprove,
      }),
      infraEnvColumn(agents),
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
    ],
    [agents, hostActions, actions],
  );

  const paginationProps = usePagination(agents.length);
  return (
    <HostsTable
      hosts={hosts}
      content={content}
      actionResolver={actionResolver}
      className={className}
      ExpandComponent={DefaultExpandComponent}
      {...paginationProps}
    >
      <AgentTableEmptyState />
    </HostsTable>
  );
};

export default AgentTable;
