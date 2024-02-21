import * as React from 'react';
import { sortable, expandable, breakWord } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import {
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
import { AGENT_BMH_NAME_LABEL_KEY, INFRAENV_GENERATED_AI_FLOW } from '../common';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import BMHStatus from './BMHStatus';
import {
  getAgentStatus,
  getAgentStatusKey,
  getBMHStatus,
  getBMHStatusKey,
  getWizardStepAgentStatus,
} from '../helpers/status';
import { filterByHostname } from '../../../common/components/hosts/utils';
import { agentStatus } from '../helpers/agentStatus';
import noop from 'lodash-es/noop.js';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';
import { AgentMachineK8sResource } from '../Hypershift/types';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { HostStatus } from '../../../common/components/hosts/types';

export const agentHostnameColumn = (
  t: TFunction,
  hosts: Host[],
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  onEditHostname?: HostsTableActions['onEditHost'],
  canEditHostname?: HostsTableActions['canEditHost'],
  canEditBMH?: HostsTableActions['canEditBMH'],
): TableRow<Host> => ({
  header: {
    title: t('ai:Hostname'),
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
          ? t('ai:BMC')
          : t('ai:Discovery ISO');
      } else {
        const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
        if (bmh) {
          discoveryType = t('ai:BMC');
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
  agentStatuses: HostStatus<string>;
  bareMetalHosts?: BareMetalHostK8sResource[];
  bmhStatuses?: HostStatus<string>;
  onEditHostname?: AgentTableActions['onEditHost'];
  onApprove?: AgentTableActions['onApprove'];
  wizardStepId?: ClusterDeploymentWizardStepsType;
  t: TFunction;
  isDay2?: boolean;
};

export const agentStatusColumn = ({
  agents,
  agentStatuses,
  bareMetalHosts,
  bmhStatuses,
  onEditHostname,
  onApprove,
  wizardStepId,
  t,
  isDay2,
}: AgentStatusColumnProps): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Status'),
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
      } else if (bmh && bmhStatuses) {
        bmhStatus = getBMHStatus(bmh, bmhStatuses);
        title = <BMHStatus bmhStatus={bmhStatus} />;
      }

      return {
        title,
        props: { 'data-testid': 'host-status' },
        sortableValue: agent
          ? wizardStepId
            ? getWizardStepAgentStatus(agent, wizardStepId, t).status.title
            : getAgentStatus(agent, agentStatuses).status.title
          : bmhStatus?.state.title || '',
      };
    },
  };
};

export const clusterColumn = (
  agents: AgentK8sResource[],
  agentMachines: AgentMachineK8sResource[],
  getClusterDeploymentLink: (cd: { name: string; namespace: string }) => string,
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
      let cdLink: string | undefined = undefined;
      if (agent?.spec?.clusterDeploymentName) {
        //hypershift
        const amNamespace = agent.metadata?.annotations?.['agentMachineRefNamespace'];
        if (amNamespace) {
          const am = agentMachines.find(
            (am) =>
              am.status?.agentRef?.name === agent.metadata?.name &&
              am.status?.agentRef?.namespace === agent.metadata?.namespace,
          );
          const nodePool = am?.metadata?.annotations?.['hypershift.openshift.io/nodePool'];
          if (nodePool) {
            const hcNamespace = nodePool.split('/')[0];
            const hcName = agent.spec.clusterDeploymentName.name;
            cdLink = getClusterDeploymentLink({ name: hcName, namespace: hcNamespace });
          }
        } else {
          cdLink = getClusterDeploymentLink(agent.spec.clusterDeploymentName);
        }
      }
      return {
        title: cdLink ? <Link to={cdLink}>{agent?.spec?.clusterDeploymentName?.name}</Link> : '--',
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
          to={`/multicloud/infrastructure/environments/details/${
            agent.metadata?.namespace || ''
          }/${infraEnvName}/overview`}
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
  const canEdit = ['deprovisioning', 'pending', 'registering'].includes(getBMHStatusKey(bmh) || '');

  return [
    canEdit,
    canEdit
      ? undefined
      : t(
          'ai:Bare metal host cannot be edited. Remove this host and add it again if a change is needed.',
        ),
  ];
};

export const canEditAgent = (
  agent: AgentK8sResource,
  agentStatuses: HostStatus<string>,
  t: TFunction,
): ActionCheck => {
  const enabled = getAgentStatus(agent, agentStatuses).status.category !== 'Installation related';
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
    agentStatuses: HostStatus<string>,
    bareMetalHosts: BareMetalHostK8sResource[],
    t: TFunction,
  ): ((h: Host) => ActionCheck) =>
  (h: Host) => {
    const agent = agents.find((a) => a.metadata?.uid === h.id);
    if (agent) {
      return canEditAgent(agent, agentStatuses, t);
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

  const statusKey = getAgentStatusKey(agent);
  if (
    [
      'preparing-for-installation',
      'installing',
      'installing-in-progress',
      'installing-pending-user-action',
      'resetting-pending-user-action',
    ].includes(statusKey)
  ) {
    return [false, t('ai:It is not possible to remove a host which is being installed.')];
  }

  if (
    ['installed', 'error', 'cancelled'].includes(statusKey) &&
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

  if (
    !agent.metadata?.labels?.hasOwnProperty(AGENT_BMH_NAME_LABEL_KEY) &&
    agent.metadata?.labels?.hasOwnProperty(INFRAENV_GENERATED_AI_FLOW) &&
    !!agent.spec.clusterDeploymentName
  ) {
    return [false, t('ai:It is not possible to remove this node from the cluster.')];
  }

  return [true, undefined];
};

const canDeleteAgent = (
  agent: AgentK8sResource,
  agentStatuses: HostStatus<string>,
  t: TFunction,
): ActionCheck => {
  const enabled = getAgentStatus(agent, agentStatuses).status.category !== 'Installation related';

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
  const agentStatuses = agentStatus(t);
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
          return canEditAgent(agent, agentStatuses, t);
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
            return canDeleteAgent(agent, agentStatuses, t);
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
      t,
      bmhs,
      infraEnv,
      onEditHost,
      onDeleteHost,
      onEditRole,
      onSetInstallationDiskId,
      onSelect,
      onEditBMH,
      onUnbindHost,
      agentStatuses,
      agentClusterInstalls,
    ],
  );
  const actionResolver = React.useMemo(() => hostActionResolver({ t, ...actions }), [actions, t]);
  return [hosts, actions, actionResolver];
};

const filterByStatus = (
  hosts: Host[],
  agents: AgentK8sResource[],
  agentStatuses: HostStatus<string>,
  bareMetalHosts: BareMetalHostK8sResource[],
  statusFilter: string[],
) => {
  if (!statusFilter?.length) {
    return hosts;
  }
  const statusKeys = Object.keys(agentStatuses).filter((k) =>
    statusFilter.includes(agentStatuses[k].title),
  );
  return hosts.filter((h) => {
    const agent = agents.find((a) => a.metadata?.uid === h.id);
    if (!agent) {
      const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === h.id);
      if (!bmh) {
        return false;
      }
      return statusKeys.includes(getBMHStatusKey(bmh) || '');
    }
    const { status } = getAgentStatus(agent, agentStatuses);
    return statusKeys.includes(status.key);
  });
};

export const filterHosts = (
  hosts: Host[],
  agents: AgentK8sResource[],
  agentStatuses: HostStatus<string>,
  bareMetalHosts: BareMetalHostK8sResource[],
  hostnameFilter: string | undefined,
  statusFilter: string[],
) => {
  const byHostname = filterByHostname(hosts, hostnameFilter);
  const byStatus = filterByStatus(byHostname, agents, agentStatuses, bareMetalHosts, statusFilter);

  return byStatus;
};

type UseAgentsFilterArgs = {
  agents: AgentK8sResource[];
  agentStatuses: HostStatus<string>;
  bmhs: BareMetalHostK8sResource[];
  bmhStatuses: HostStatus<string>;
  hosts: Host[];
};

export type StatusCount = Record<string, number>;

export const useAgentsFilter = ({
  agents,
  agentStatuses,
  bmhs,
  bmhStatuses,
  hosts,
}: UseAgentsFilterArgs) => {
  const [hostnameFilter, setHostnameFilter] = React.useState<string>();
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const statusCount = Object.keys(agentStatuses).reduce((acc, curr) => {
    acc[agentStatuses[curr].title] = 0;
    return acc;
  }, {} as StatusCount);
  hosts.forEach((host) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    const bmh = bmhs.find((bmh) => bmh.metadata?.uid === host.id);
    if (agent) {
      const { status } = getAgentStatus(agent, agentStatuses);
      statusCount[status.title]++;
    } else if (bmh) {
      const { state } = getBMHStatus(bmh, bmhStatuses);
      statusCount[state.title]++;
    }
  });

  const filteredHosts = filterHosts(
    hosts,
    agents,
    agentStatuses,
    bmhs,
    hostnameFilter,
    statusFilter,
  );

  return {
    statusCount,
    hostnameFilter,
    setHostnameFilter,
    statusFilter,
    setStatusFilter,
    filteredHosts,
  };
};
