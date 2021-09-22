import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { Host, HostsTableActions } from '../../../common';
import { AgentK8sResource, InfraEnvK8sResource } from '../../types';
import AgentStatus from './AgentStatus';
import { ActionsResolver, TableRow } from '../../../common/components/hosts/AITable';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { hostActionResolver } from '../../../common/components/hosts/tableUtils';
import { getAIHosts } from '../helpers';
import { AGENT_BMH_HOSTNAME_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import NetworkingStatus from '../status/NetworkingStatus';
import { getAgentStatus } from '../helpers/status';

export const discoveryTypeColumn = (
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
): TableRow<Host> => ({
  header: { title: 'Discovery type', transforms: [sortable] },
  cell: (host) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    let discoveryType = 'Unknown';
    if (agent) {
      discoveryType = agent?.metadata?.labels?.hasOwnProperty(AGENT_BMH_HOSTNAME_LABEL_KEY)
        ? 'BMC'
        : 'Discovery ISO';
    } else {
      const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
      if (bmh) {
        discoveryType = 'BMC';
      }
    }
    return {
      title: discoveryType,
      props: { 'data-testid': 'discovery-type' },
      sortableValue: discoveryType,
    };
  },
});

type StatusColumnProps = {
  agents: AgentK8sResource[];
  onEditHostname?: ClusterDeploymentHostsTablePropsActions['onEditHost'];
  onApprove?: ClusterDeploymentHostsTablePropsActions['onApprove'];
};

export const infraEnvStatusColumn = ({
  agents,
  onEditHostname,
  onApprove,
}: StatusColumnProps): TableRow<Host> => {
  return {
    header: { title: 'Status', transforms: [sortable] },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      let title: React.ReactNode = '--';
      if (agent) {
        const editHostname = onEditHostname ? () => onEditHostname(agent) : undefined;
        title = <AgentStatus agent={agent} onApprove={onApprove} onEditHostname={editHostname} />;
      }

      return {
        title,
        props: { 'data-testid': 'host-status' },
        sortableValue: agent ? getAgentStatus(agent)[0] : '',
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
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      let title: React.ReactNode = '--';
      if (agent?.spec?.clusterDeploymentName) {
        title = (
          <Link to={getClusterDeploymentLink(agent.spec.clusterDeploymentName)}>
            {agent.spec.clusterDeploymentName.name}
          </Link>
        );
      }
      return {
        title,
        props: { 'data-testid': 'cluster' },
        sortableValue: agent?.spec?.clusterDeploymentName?.name ?? '--',
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

export const networkingStatusColumn = (
  onEditHostname?: HostsTableActions['onEditHost'],
  isSNOCluster?: boolean,
): TableRow<Host> => ({
  header: { title: 'Status', transforms: [sortable] },
  cell: (host) => {
    const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
    return {
      title: (
        <NetworkingStatus host={host} onEditHostname={editHostname} isSNOCluster={!!isSNOCluster} />
      ),
      props: { 'data-testid': 'nic-status' },
      sortableValue: status,
    };
  },
});

type AgentsTableResources = {
  agents: AgentK8sResource[];
  bmhs?: BareMetalHostK8sResource[];
  infraEnv?: InfraEnvK8sResource;
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
    onEditBMH,
  }: ClusterDeploymentHostsTablePropsActions,
  { agents, bmhs, infraEnv }: AgentsTableResources,
): [Host[], HostsTableActions, ActionsResolver<Host>] => {
  const [hosts, actions] = React.useMemo(
    () => [
      getAIHosts(agents, bmhs, infraEnv),
      {
        onEditHost: onEditHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return onEditHost(agent);
            }
          : undefined,
        canEditHost: canEditHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              return agent ? canEditHost(agent) : false;
            }
          : undefined,
        onDeleteHost: onDeleteHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              const bmh = bmhs?.find((a) => a.metadata?.uid === host.id);
              return onDeleteHost(agent, bmh);
            }
          : undefined,
        canDelete: canDelete
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              const bmh = bmhs?.find((a) => a.metadata?.uid === host.id);
              return canDelete(agent, bmh);
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
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              return agent ? canEditRole(agent) : false;
            }
          : undefined,
        onSelect: onSelect
          ? (host: Host, selected: boolean) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              return onSelect(agent, selected);
            }
          : undefined,
        onEditBMH: onEditBMH
          ? (host: Host) => {
              const bmh = bmhs?.find(
                (h) => h.metadata?.uid === host.id,
              ) as BareMetalHostK8sResource;
              return onEditBMH(bmh);
            }
          : undefined,
        canEditBMH: (host: Host) => !!bmhs?.find((h) => h.metadata?.uid === host.id),
      },
    ],
    [
      onEditHost,
      canEditHost,
      onDeleteHost,
      canDelete,
      onEditRole,
      canEditRole,
      agents,
      onSelect,
      onEditBMH,
      bmhs,
      infraEnv,
    ],
  );
  const actionResolver = React.useMemo(() => hostActionResolver(actions), [actions]);
  return [hosts, actions, actionResolver];
};
