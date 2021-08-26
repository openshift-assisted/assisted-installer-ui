import * as React from 'react';
import { expandable, IRowData, sortable } from '@patternfly/react-table';
import { Host, HostsTable, HostsTableActions, HostsTableProps } from '../../../common';
import { AdditionalNTPSourcesDialogToggle } from '../../../ocm/components/hosts/AdditionaNTPSourceDialogToggle';
import { AgentK8sResource } from '../../types';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers';
import DefaultEmptyState from '../../../common/components/ui/uiState/EmptyState';
import { ConnectedIcon } from '@patternfly/react-icons';

type GetAgentCallback = <R>(
  agentCallback: ((agent: AgentK8sResource) => R) | undefined,
  agents: AgentK8sResource[],
) => ((host: Host) => R) | undefined;

const getAgentCallback: GetAgentCallback = (agentCallback, agents) =>
  agentCallback
    ? (host) => {
        const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
        return agentCallback(agent);
      }
    : undefined;

export const useAgentTableActions = ({
  onDeleteHost,
  onEditRole,
  onEditHost,
  canDelete,
  canEditHost,
  canEditRole,
  agents,
}: ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
}): HostsTableActions =>
  React.useMemo(
    () => ({
      onDeleteHost: onDeleteHost
        ? (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
            const agent = agents.find(
              (a) => a.metadata?.uid === rowData.host.id,
            ) as AgentK8sResource;
            onDeleteHost(agent);
          }
        : undefined,
      onEditRole: onEditRole
        ? (host: Host, role: string | undefined) => {
            const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
            return onEditRole(agent, role);
          }
        : undefined,
      onEditHost: getAgentCallback(onEditHost, agents),
      canDelete: getAgentCallback(canDelete, agents),
      canEditHost: getAgentCallback(canEditHost, agents),
      canEditRole: getAgentCallback(canEditRole, agents),
    }),
    [onDeleteHost, onEditHost, onEditRole, canDelete, canEditHost, canEditRole, agents],
  );

const defaultColumns = [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Discovered At', transforms: [sortable] },
  { title: 'CPU Cores', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'Memory', transforms: [sortable] },
  { title: 'Disk', transforms: [sortable] },
  { title: '' },
];

const AgentTableEmptyState = () => (
  <DefaultEmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Hosts may take a few minutes to appear here after booting."
  />
);

type AgentTableProps = ClusterDeploymentHostsTablePropsActions & {
  agents: AgentK8sResource[];
  className?: string;
  columns?: HostsTableProps['columns'];
  hostToHostTableRow?: HostsTableProps['hostToHostTableRow'];
  EmptyState?: HostsTableProps['EmptyState'];
};

const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  className,
  columns = defaultColumns,
  hostToHostTableRow,
  EmptyState = AgentTableEmptyState,
  ...actions
}) => {
  const tableCallbacks = useAgentTableActions({
    ...actions,
    agents,
  });
  const restHosts = getAIHosts(agents);
  return (
    <HostsTable
      hosts={restHosts}
      EmptyState={EmptyState}
      columns={columns}
      className={className}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
      hostToHostTableRow={hostToHostTableRow}
      {...tableCallbacks}
    />
  );
};

export default AgentTable;
