import * as React from 'react';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { ConnectedIcon } from '@patternfly/react-icons';
import {
  getInfraEnvLinkType,
  infraEnvColumn,
  infraEnvStatusColumn,
  useAgentsTable,
} from './tableUtils';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import HostsTable, { DefaultExpandComponent } from '../../../common/components/hosts/HostsTable';

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
  getInfraEnvLink?: getInfraEnvLinkType;
};

const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  className,
  getInfraEnvLink,
  ...actions
}) => {
  const [hosts, hostActions, actionResolver] = useAgentsTable(actions, { agents });
  const content = React.useMemo(
    () => [
      hostnameColumn(hostActions.onEditHost),
      roleColumn(hostActions.canEditRole, hostActions.onEditRole),
      infraEnvStatusColumn({
        agents,
        onEditHostname: actions.onEditHost,
        onApprove: actions.onApprove,
      }),
      infraEnvColumn(agents, getInfraEnvLink),
      cpuCoresColumn,
      memoryColumn,
      disksColumn,
    ],
    [agents, hostActions, actions, getInfraEnvLink],
  );
  return (
    <HostsTable
      hosts={hosts}
      content={content}
      actionResolver={actionResolver}
      className={className}
      ExpandComponent={DefaultExpandComponent}
    >
      <AgentTableEmptyState />
    </HostsTable>
  );
};

export default AgentTable;
