import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import { Host, HostsTableActions } from '../../../common';
import { AgentK8sResource } from '../../types';
import AgentStatus from './AgentStatus';
import { Link } from 'react-router-dom';
import { ActionsResolver, TableRow } from '../../../common/components/hosts/AITable';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { hostActionResolver } from '../../../common/components/hosts/tableUtils';
import { getAIHosts } from '../helpers';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';

export const discoveryTypeColumn = (agents: AgentK8sResource[]): TableRow<Host> => ({
  header: { title: 'Discovery type', transforms: [sortable] },
  cell: (host) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
    const discoveryType = agent?.metadata?.labels?.hasOwnProperty('agent-install.openshift.io/bmh')
      ? 'BMC'
      : 'Discovery ISO';
    return {
      title: discoveryType,
      props: { 'data-testid': 'discovery-type' },
      sortableValue: discoveryType,
    };
  },
});

export const statusColumn = (
  agents: AgentK8sResource[],
  onEditHostname?: ClusterDeploymentHostsTablePropsActions['onEditHost'],
  onApprove?: ClusterDeploymentHostsTablePropsActions['onApprove'],
): TableRow<Host> => {
  return {
    header: { title: 'Status', transforms: [sortable] },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
      const editHostname = onEditHostname ? () => onEditHostname(agent) : undefined;
      return {
        title: <AgentStatus agent={agent} onApprove={onApprove} onEditHostname={editHostname} />,
        props: { 'data-testid': 'host-status' },
        sortableValue: status,
      };
    },
  };
};

export const clusterColumn = (
  agents: AgentK8sResource[],
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string,
): TableRow<Host> => {
  return {
    header: { title: 'Cluster', transforms: [sortable] },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
      return {
        title: agent?.spec?.clusterDeploymentName ? (
          <Link to={getClusterDeploymentLink(agent.spec.clusterDeploymentName)}>
            {agent.spec.clusterDeploymentName.name}
          </Link>
        ) : (
          '--'
        ),
        props: { 'data-testid': 'cluster' },
        sortableValue: agent?.spec?.clusterDeploymentName.name ?? '--',
      };
    },
  };
};

export const infraEnvColumn = (agents: AgentK8sResource[]): TableRow<Host> => {
  return {
    header: { title: 'Infrastructure env', transforms: [sortable] },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
      const infraEnvName = agent.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] || 'N/A';

      return {
        title: infraEnvName,
        props: { 'data-testid': 'infra-env' },
        sortableValue: infraEnvName,
      };
    },
  };
};
export const useAgentsTable = (
  {
    onEditHost,
    canEditHost,
    onDeleteHost,
    canDelete,
    onEditRole,
    canEditRole,
    onSelect,
  }: ClusterDeploymentHostsTablePropsActions,
  agents: AgentK8sResource[],
): [Host[], HostsTableActions, ActionsResolver<Host>] => {
  const [hosts, actions] = React.useMemo(
    () => [
      getAIHosts(agents),
      {
        onEditHost: onEditHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return onEditHost(agent);
            }
          : undefined,
        canEditHost: canEditHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return canEditHost(agent);
            }
          : undefined,
        onDeleteHost: onDeleteHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return onDeleteHost(agent);
            }
          : undefined,
        canDelete: canDelete
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return canDelete(agent);
            }
          : undefined,
        onEditRole: onEditRole
          ? (host: Host, role: string | undefined) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return onEditRole(agent, role);
            }
          : undefined,
        canEditRole: canEditRole
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return canEditRole(agent);
            }
          : undefined,
        onSelect: onSelect
          ? (host: Host, selected: boolean) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return onSelect(agent, selected);
            }
          : undefined,
      },
    ],
    [onEditHost, canEditHost, onDeleteHost, canDelete, onEditRole, canEditRole, agents, onSelect],
  );
  const actionResolver = React.useMemo(() => hostActionResolver(actions), [actions]);
  return [hosts, actions, actionResolver];
};
