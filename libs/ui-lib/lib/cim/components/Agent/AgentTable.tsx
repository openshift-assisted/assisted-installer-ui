import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import {
  cpuArchitectureColumn,
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
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import { AgentTableActions } from '../ClusterDeployment/types';
import { agentStatus } from '../helpers/agentStatus';
import { useAgentsTable } from './tableUtils';
import { infraEnvColumn, agentStatusColumn } from './tableColumns';

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

export type AgentTableProps = Pick<AgentTableActions, 'onUnbindHost'> & {
  agents: AgentK8sResource[];
  agentClusterInstall: AgentClusterInstallK8sResource;
  className?: string;
};

const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  agentClusterInstall,
  className,
  onUnbindHost,
}) => {
  const { t } = useTranslation();
  const agentClusterInstalls = React.useMemo(() => [agentClusterInstall], [agentClusterInstall]);
  const agentStatuses = agentStatus(t);
  const [hosts, hostActions, actionResolver] = useAgentsTable(
    { agents, agentClusterInstalls },
    {
      onUnbindHost,
    },
  );
  const content = React.useMemo(
    () => [
      hostnameColumn(t, hostActions.onEditHost),
      roleColumn(t),
      agentStatusColumn({
        agents,
        agentStatuses,
        t,
      }),
      infraEnvColumn(agents, t),
      cpuArchitectureColumn(t),
      cpuCoresColumn(t),
      memoryColumn(t),
      disksColumn(t),
    ],
    [agentStatuses, agents, hostActions.onEditHost, t],
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
