import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { Host, HostsTableActions } from '../../../common';
import { AgentK8sResource, InfraEnvK8sResource } from '../../types';
import AgentStatus from './AgentStatus';
import { ActionsResolver, TableRow } from '../../../common/components/hosts/AITable';
import { ClusterDeploymentHostsTablePropsActions } from '../ClusterDeployment/types';
import { hostActionResolver } from '../../../common/components/hosts/tableUtils';
import { getAIHosts, getInfraEnvNameOfAgent } from '../helpers';
import { AGENT_BMH_HOSTNAME_LABEL_KEY } from '../common';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import NetworkingStatus from '../status/NetworkingStatus';
import { getAgentStatus, getBMHStatus } from '../helpers/status';
import { Button, Popover } from '@patternfly/react-core';
import HardwareStatus from '../status/HardwareStatus';

export const discoveryTypeColumn = (
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
): TableRow<Host> => ({
  header: {
    title: 'Discovery type',
    props: {
      id: 'col-header-discovery-type',
    },
    transforms: [sortable],
  },
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
  bareMetalHosts?: BareMetalHostK8sResource[];
  onEditHostname?: ClusterDeploymentHostsTablePropsActions['onEditHost'];
  onApprove?: ClusterDeploymentHostsTablePropsActions['onApprove'];
};

export const infraEnvStatusColumn = ({
  agents,
  bareMetalHosts,
  onEditHostname,
  onApprove,
}: StatusColumnProps): TableRow<Host> => {
  return {
    header: {
      title: 'Status',
      props: {
        id: 'col-header-infraenvstatus',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      const bmh = bareMetalHosts?.find((b) => b.metadata?.uid === host.id);
      let bmhStatus;
      let title: React.ReactNode = '--';
      if (agent) {
        const editHostname = onEditHostname ? () => onEditHostname(agent) : undefined;
        title = <AgentStatus agent={agent} onApprove={onApprove} onEditHostname={editHostname} />;
      } else if (bmh) {
        bmhStatus = getBMHStatus(bmh);
        title = bmhStatus.message ? (
          <Popover
            headerContent="Error"
            bodyContent={bmhStatus.message}
            minWidth="30rem"
            maxWidth="50rem"
            hideOnOutsideClick
            zIndex={300}
          >
            <Button variant={'link'} isInline>
              {bmhStatus.title}
            </Button>
          </Popover>
        ) : (
          bmhStatus.title
        );
      }

      return {
        title,
        props: { 'data-testid': 'host-status' },
        sortableValue: agent ? getAgentStatus(agent)[0] : bmhStatus?.title ? bmhStatus.title : '',
      };
    },
  };
};

export const clusterColumn = (
  agents: AgentK8sResource[],
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string | React.ReactNode,
): TableRow<Host> => {
  return {
    header: {
      title: 'Cluster',
      props: {
        id: 'col-header-cluster',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      let title: React.ReactNode = '--';

      if (agent?.spec?.clusterDeploymentName) {
        const cdLink = getClusterDeploymentLink(agent.spec.clusterDeploymentName);
        title =
          typeof cdLink === 'string' ? (
            <Link to={cdLink}>{agent.spec.clusterDeploymentName.name}</Link>
          ) : (
            cdLink
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

export type getInfraEnvLinkType = ({
  name,
  namespace,
}: {
  name: string;
  namespace: string;
}) => string | React.ReactNode;

export const infraEnvColumn = (
  agents: AgentK8sResource[],
  getInfraEnvLink?: getInfraEnvLinkType,
): TableRow<Host> => {
  return {
    header: {
      title: 'Infrastructure env',
      props: {
        id: 'col-header-infraenv',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
      const infraEnvName = getInfraEnvNameOfAgent(agent);

      let title: React.ReactNode = infraEnvName || 'N/A';
      if (infraEnvName && getInfraEnvLink) {
        title = getInfraEnvLink({ name: infraEnvName, namespace: agent.metadata?.namespace || '' });
      }

      return {
        title,
        props: { 'data-testid': 'infra-env' },
        sortableValue: infraEnvName,
      };
    },
  };
};

export const networkingStatusColumn = (
  onEditHostname?: HostsTableActions['onEditHost'],
): TableRow<Host> => ({
  header: {
    title: 'Status',
    props: {
      id: 'col-header-networkingstatus',
    },
    transforms: [sortable],
  },
  cell: (host) => {
    const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
    return {
      title: <NetworkingStatus host={host} onEditHostname={editHostname} />,
      props: { 'data-testid': 'nic-status' },
      sortableValue: status,
    };
  },
});

export const hardwareStatusColumn = (): TableRow<Host> => ({
  header: {
    title: 'Status',
    props: {
      id: 'col-header-hardwarestatus',
    },
    transforms: [sortable],
  },
  cell: (host) => {
    return {
      title: <HardwareStatus host={host} />,
      props: { 'data-testid': 'hardware-status' },
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
    onUnbindHost,
    canUnbindHost,
  }: ClusterDeploymentHostsTablePropsActions,
  { agents, bmhs, infraEnv }: AgentsTableResources,
): [Host[], HostsTableActions, ActionsResolver<Host>] => {
  const [hosts, actions] = React.useMemo(
    (): [Host[], HostsTableActions] => [
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
        onUnbindHost: onUnbindHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
              // const bmh = bmhs?.find((a) => a.metadata?.uid === host.id);
              return onUnbindHost(agent);
            }
          : undefined,
        canUnbindHost: canUnbindHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              return agent ? canUnbindHost(agent) : [false, '' /* Only agent can be unbound */];
            }
          : undefined,
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
      onUnbindHost,
      canUnbindHost,
      bmhs,
      infraEnv,
    ],
  );
  const actionResolver = React.useMemo(() => hostActionResolver(actions), [actions]);
  return [hosts, actions, actionResolver];
};
