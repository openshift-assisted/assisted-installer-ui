import * as React from 'react';
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import { infraEnvColumn, agentStatusColumn, useAgentsTable } from '../Agent/tableUtils';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
  roleColumn,
} from '../../../common/components/hosts/tableUtils';
import HostsTable, { DefaultExpandComponent } from '../../../common/components/hosts/HostsTable';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { agentStatus } from '../helpers/agentStatus';

export const getAgentId = (agent: AgentK8sResource) => agent.metadata?.uid as string;

export const AgentTableEmptyState = () => {
  const { t } = useTranslation();
  return (
    <DefaultEmptyState
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
