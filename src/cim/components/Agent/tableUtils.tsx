import * as React from 'react';
import { sortable, expandable, breakWord } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import {
  Host,
  HostsTableActions,
  getInventory,
  getHostname,
  Hostname,
  ActionCheck,
} from '../../../common';
import { AgentClusterInstallK8sResource, AgentK8sResource, InfraEnvK8sResource } from '../../types';
import AgentStatus from './AgentStatus';
import { ActionsResolver, TableRow } from '../../../common/components/hosts/AITable';
import { AgentTableActions, ClusterDeploymentWizardStepsType } from '../ClusterDeployment/types';
import { hostActionResolver } from '../../../common/components/hosts/tableUtils';
import { getAgentClusterInstallOfAgent, getAIHosts, getInfraEnvNameOfAgent } from '../helpers';
import { isInstallationInProgress } from '../ClusterDeployment/helpers';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import BMHStatus from './BMHStatus';
import { getAgentStatus, getBMHStatus, getWizardStepAgentStatus } from '../helpers/status';
import { filterByHostname } from '../../../common/components/hosts/utils';
import { agentStatus, bmhStatus } from '../helpers/agentStatus';
import noop from 'lodash/noop';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

export const agentHostnameColumn = (
  hosts: Host[],
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  onEditHostname?: HostsTableActions['onEditHost'],
  canEditHostname?: HostsTableActions['canEditHost'],
  canEditBMH?: HostsTableActions['canEditBMH'],
): TableRow<Host> => ({
  header: {
    title: 'Hostname',
    props: {
      id: 'col-header-hostname', // ACM jest tests require id over testId
    },
    transforms: [sortable],
    cellFormatters: [expandable],
    cellTransforms: [breakWord],
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
    const computedHostname = getHostname(host, inventory);

    let readonly = true;

    const agent = agents.find((a) => a.metadata?.uid === host.id);
    if (agent) {
      readonly = canEditHostname ? !canEditHostname(host) : false;
    } else {
      const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
      if (bmh && canEditBMH) {
        readonly = !canEditBMH(host);
      }
    }

    return {
      title: (
        <Hostname
          host={host}
          inventory={inventory}
          onEditHostname={editHostname}
          hosts={hosts}
          readonly={readonly}
        />
      ),
      props: { 'data-testid': 'host-name' },
      sortableValue: computedHostname || '',
    };
  },
});

export const discoveryTypeColumn = (
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  t: TFunction,
): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Discovery type'),
      props: {
        id: 'col-header-discovery-type',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      let discoveryType = t('ai:Unknown');
      if (agent) {
        // eslint-disable-next-line no-prototype-builtins
        discoveryType = agent?.metadata?.labels?.hasOwnProperty(AGENT_BMH_NAME_LABEL_KEY)
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
  };
};

type AgentStatusColumnProps = {
  agents: AgentK8sResource[];
  bareMetalHosts?: BareMetalHostK8sResource[];
  onEditHostname?: AgentTableActions['onEditHost'];
  onApprove?: AgentTableActions['onApprove'];
  wizardStepId?: ClusterDeploymentWizardStepsType;
  t: TFunction;
  isDay2?: boolean;
};

export const agentStatusColumn = ({
  agents,
  bareMetalHosts,
  onEditHostname,
  onApprove,
  wizardStepId,
  t,
  isDay2,
}: AgentStatusColumnProps): TableRow<Host> => {
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
        title = (
          <AgentStatus
            agent={agent}
            onApprove={onApprove}
            onEditHostname={editHostname}
            wizardStepId={wizardStepId}
            isDay2={isDay2}
          />
        );
      } else if (bmh) {
        bmhStatus = getBMHStatus(bmh);
        title = <BMHStatus bmhStatus={bmhStatus} />;
      }

      return {
        title,
        props: { 'data-testid': 'host-status' },
        sortableValue: agent
          ? wizardStepId
            ? getWizardStepAgentStatus(agent, wizardStepId, t).status.title
            : getAgentStatus(agent).status.title
          : bmhStatus?.state.title || '',
      };
    },
  };
};

export const clusterColumn = (
  agents: AgentK8sResource[],
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string | React.ReactNode,
  t: TFunction,
): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Cluster'),
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

export const infraEnvColumn = (agents: AgentK8sResource[], t: TFunction): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Infrastructure env'),
      props: {
        id: 'col-header-infraenv',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
      const infraEnvName = getInfraEnvNameOfAgent(agent);
      const title = infraEnvName ? (
        <Link
          to={`/multicloud/infrastructure/environments/details/${agent.metadata?.namespace}/${infraEnvName}/overview`}
        >
          {infraEnvName}
        </Link>
      ) : (
        'N/A'
      );
      return {
        title,
        props: { 'data-testid': 'infra-env' },
        sortableValue: infraEnvName,
      };
    },
  };
};

export const canEditBMH = (bmh: BareMetalHostK8sResource, t: TFunction): ActionCheck => {
  const canEdit = [
    bmhStatus.deprovisioning.key,
    bmhStatus.pending.key,
    bmhStatus.registering.key,
  ].includes(getBMHStatus(bmh).state.key);

  return [
    canEdit,
    canEdit
      ? undefined
      : t(
          'ai:Bare metal host cannot be edited. Remove this host and add it again if a change is needed.',
        ),
  ];
};

export const canEditAgent = (agent: AgentK8sResource, t: TFunction): ActionCheck => {
  const enabled = getAgentStatus(agent).status.category !== 'Installation related';
  return [
    enabled,
    enabled
      ? undefined
      : t('ai:Hostname cannot be edited while host is either installed or being installed.'),
  ];
};

export const canChangeHostname =
  (
    agents: AgentK8sResource[],
    bareMetalHosts: BareMetalHostK8sResource[],
    t: TFunction,
  ): ((h: Host) => ActionCheck) =>
  (h: Host) => {
    const agent = agents.find((a) => a.metadata?.uid === h.id);
    if (agent) {
      return canEditAgent(agent, t);
    }
    const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === h.id);
    if (bmh) {
      return canEditBMH(bmh, t);
    }
    return [true, undefined];
  };

export const canUnbindAgent = (
  agentClusterInstalls: AgentClusterInstallK8sResource[] | undefined,
  agent: AgentK8sResource,
  t: TFunction,
): ActionCheck => {
  if (!agent?.spec.clusterDeploymentName?.name) {
    return [false, t('ai:The agent is not bound to a cluster.')];
  }

  const { status } = getAgentStatus(agent);
  if (
    [
      'preparing-for-installation',
      'installing',
      'installing-in-progress',
      'installing-pending-user-action',
      'resetting-pending-user-action',
    ].includes(status.key)
  ) {
    return [false, t('ai:It is not possible to remove a host which is being installed.')];
  }

  if (
    ['installed', 'error', 'cancelled'].includes(status.key) &&
    (agent.status?.role === 'master' || agent.status?.role === 'bootstrap')
  ) {
    return [
      false,
      t('ai:It is not possible to remove control plane node from an installed cluster.'),
    ];
  }

  if (agentClusterInstalls) {
    const agentClusterInstall = getAgentClusterInstallOfAgent(agentClusterInstalls, agent);

    if (agentClusterInstall) {
      if (isInstallationInProgress(agentClusterInstall)) {
        return [
          false,
          t('ai:It is not possible to remove a node from a cluster during installation.'),
        ];
      }
    }
  }

  return [true, undefined];
};

const canDeleteAgent = (agent: AgentK8sResource, t: TFunction): ActionCheck => {
  const enabled = getAgentStatus(agent).status.category !== 'Installation related';

  return [
    enabled,
    enabled
      ? undefined
      : t('ai:Host cannot be deleted while host is either installed or being installed.'),
  ];
};

type AgentsTableResources = {
  agents: AgentK8sResource[];
  bmhs?: BareMetalHostK8sResource[];
  infraEnv?: InfraEnvK8sResource;
  agentClusterInstalls?: AgentClusterInstallK8sResource[];
};

export const useAgentsTable = (
  { agents, bmhs, infraEnv, agentClusterInstalls }: AgentsTableResources,
  tableActions?: Partial<AgentTableActions>,
): [Host[], HostsTableActions, ActionsResolver<Host>] => {
  const {
    onEditHost,
    onDeleteHost,
    onEditRole,
    onSelect,
    onEditBMH,
    onUnbindHost,
    onSetInstallationDiskId,
  } = tableActions || {};
  const { t } = useTranslation();
  const [hosts, actions] = React.useMemo(
    (): [Host[], HostsTableActions] => [
      getAIHosts(agents, bmhs, infraEnv),
      {
        onEditHost: onEditHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              if (agent) {
                return onEditHost(agent);
              }
              const bmh = bmhs?.find((bmh) => bmh.metadata?.uid === host.id);
              if (bmh && onEditBMH) {
                return onEditBMH(bmh);
              }
              return noop;
            }
          : undefined,
        canEditHost: (host: Host) => {
          const agent = agents.find((a) => a.metadata?.uid === host.id);
          if (!agent) {
            return false;
          }
          return canEditAgent(agent, t);
        },
        onDeleteHost: onDeleteHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              const bmh = bmhs?.find((a) => a.metadata?.uid === host.id);
              return onDeleteHost(agent, bmh);
            }
          : undefined,
        canDelete: (host: Host) => {
          const agent = agents.find((a) => a.metadata?.uid === host.id);
          const bmh = bmhs?.find((a) => a.metadata?.uid === host.id);

          if (agent) {
            return canDeleteAgent(agent, t);
          } else if (bmh) {
            return [true, undefined];
          }

          return [false, t('ai:Host not found')];
        },
        onEditRole: onEditRole
          ? (host: Host, role: string | undefined) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              return agent ? onEditRole(agent, role) : Promise.resolve(agent);
            }
          : undefined,
        canEditRole: () => !!onEditRole,
        onDiskRole: onSetInstallationDiskId
          ? (hostId, diskId) => {
              const agent = agents.find((a) => a.metadata?.uid === hostId);
              if (agent && diskId) {
                return onSetInstallationDiskId(agent, diskId);
              }
              return Promise.resolve(agent);
            }
          : undefined,
        canEditDisks: () => !!onSetInstallationDiskId,
        onSelect: onSelect
          ? (host: Host, selected: boolean) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              return agent ? onSelect(agent, selected) : noop;
            }
          : undefined,
        onEditBMH: onEditBMH
          ? (host: Host) => {
              const bmh = bmhs?.find((h) => h.metadata?.uid === host.id);
              return bmh ? onEditBMH(bmh) : noop;
            }
          : undefined,
        canEditBMH: (host: Host) => {
          const bmh = bmhs?.find((h) => h.metadata?.uid === host.id);

          if (!bmh) {
            return [false, t('ai:Bare metal host not found')];
          }
          return canEditBMH(bmh, t);
        },
        onUnbindHost: onUnbindHost
          ? (host: Host) => {
              const agent = agents.find((a) => a.metadata?.uid === host.id);
              return agent ? onUnbindHost(agent) : noop;
            }
          : undefined,
        canUnbindHost: (host: Host) => {
          const agent = agents.find((a) => a.metadata?.uid === host.id);

          if (agent) {
            return canUnbindAgent(agentClusterInstalls, agent, t);
          }
          const bmh = bmhs?.find((bmh) => bmh.metadata?.uid === host.id);
          if (bmh) {
            return [false, t('ai:Bare metal host cannot be removed from cluster.')];
          }
          return [false, t('ai:Host not found')];
        },
      },
    ],
    [
      agents,
      bmhs,
      infraEnv,
      onEditHost,
      onDeleteHost,
      onEditRole,
      onSetInstallationDiskId,
      onSelect,
      onEditBMH,
      onUnbindHost,
      t,
      agentClusterInstalls,
    ],
  );
  const actionResolver = React.useMemo(() => hostActionResolver(actions), [actions]);
  return [hosts, actions, actionResolver];
};

const filterByStatus = (
  hosts: Host[],
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  statusFilter: string[],
) => {
  if (!statusFilter?.length) {
    return hosts;
  }
  const statusKeys = Object.keys(agentStatus).filter((k) =>
    statusFilter.includes(agentStatus[k].title),
  );
  return hosts.filter((h) => {
    const agent = agents.find((a) => a.metadata?.uid === h.id);
    if (!agent) {
      const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === h.id);
      if (!bmh) {
        return false;
      }
      const bmhStatus = getBMHStatus(bmh);
      return statusKeys.includes(bmhStatus.state.key);
    }
    const { status } = getAgentStatus(agent);
    return statusKeys.includes(status.key);
  });
};

export const filterHosts = (
  hosts: Host[],
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  hostnameFilter: string | undefined,
  statusFilter: string[],
) => {
  const byHostname = filterByHostname(hosts, hostnameFilter);
  const byStatus = filterByStatus(byHostname, agents, bareMetalHosts, statusFilter);

  return byStatus;
};

type UseAgentsFilterArgs = {
  agents: AgentK8sResource[];
  bmhs: BareMetalHostK8sResource[];
  hosts: Host[];
};

export type StatusCount = Record<string, number>;

export const useAgentsFilter = ({ agents, bmhs, hosts }: UseAgentsFilterArgs) => {
  const [hostnameFilter, setHostnameFilter] = React.useState<string>();
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const statusCount = Object.keys(agentStatus).reduce((acc, curr) => {
    acc[agentStatus[curr].title] = 0;
    return acc;
  }, {} as StatusCount);
  hosts.forEach((host) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    const bmh = bmhs.find((bmh) => bmh.metadata?.uid === host.id);
    if (agent) {
      const { status } = getAgentStatus(agent);
      statusCount[status.title]++;
    } else if (bmh) {
      const { state } = getBMHStatus(bmh);
      statusCount[state.title]++;
    }
  });

  const filteredHosts = filterHosts(hosts, agents, bmhs, hostnameFilter, statusFilter);

  return {
    statusCount,
    hostnameFilter,
    setHostnameFilter,
    statusFilter,
    setStatusFilter,
    filteredHosts,
  };
};
