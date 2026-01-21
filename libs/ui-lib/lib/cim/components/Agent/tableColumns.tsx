import * as React from 'react';
import { TFunction } from 'i18next';
import { Link } from 'react-router-dom-v5-compat';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { HostsTableActions, getInventory, getHostname, Hostname } from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import { HostStatus } from '../../../common/components/hosts/types';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { AgentTableActions, ClusterDeploymentWizardStepsType } from '../ClusterDeployment';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common';
import {
  getBMHStatus,
  getWizardStepAgentStatus,
  getAgentStatus,
  getInfraEnvNameOfAgent,
} from '../helpers';
import { AgentMachineK8sResource } from '../Hypershift';
import AgentStatus from './AgentStatus';
import BMHStatus from './BMHStatus';
import { BMHStatusInfo } from './BMHStatusInfo';

export const agentHostnameColumn = (
  t: TFunction,
  hosts: Host[],
  agents: AgentK8sResource[],
  bareMetalHosts: BareMetalHostK8sResource[],
  onEditHostname?: HostsTableActions['onEditHost'],
  canEditHostname?: HostsTableActions['canEditHostname'],
  canEditBMH?: HostsTableActions['canEditBMH'],
): TableRow<Host> => ({
  header: {
    title: t<string>('ai:Hostname'),
    props: {
      id: 'col-header-hostname', // ACM jest tests require id over testId
      modifier: 'breakWord',
    },
    sort: true,
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
      title: t<string>('ai:Discovery type'),
      props: {
        id: 'col-header-discovery-type',
      },
      sort: true,
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      let discoveryType = t<string>('ai:Unknown');
      if (agent) {
        // eslint-disable-next-line no-prototype-builtins
        discoveryType = agent?.metadata?.labels?.hasOwnProperty(AGENT_BMH_NAME_LABEL_KEY)
          ? t<string>('ai:BMC')
          : t<string>('ai:Discovery ISO');
      } else {
        const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
        if (bmh) {
          discoveryType = t<string>('ai:BMC');
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
      title: t<string>('ai:Status'),
      props: {
        id: 'col-header-infraenvstatus',
      },
      sort: true,
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      const bmh = bareMetalHosts?.find(
        (b) =>
          b.metadata?.annotations?.['bmac.agent-install.openshift.io/hostname'] ===
          host.requestedHostname,
      );

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
            additionalBMHInfo={
              bmh &&
              bmhStatuses && <BMHStatusInfo bmhStatus={getBMHStatus(bmh, bmhStatuses)} bmh={bmh} />
            }
          />
        );
      } else if (bmh && bmhStatuses) {
        bmhStatus = getBMHStatus(bmh, bmhStatuses);
        title = <BMHStatus bmhStatus={bmhStatus} bmh={bmh} />;
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
      title: t<string>('ai:Cluster'),
      props: {
        id: 'col-header-cluster',
      },
      sort: true,
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
      title: t<string>('ai:Infrastructure env'),
      props: {
        id: 'col-header-infraenv',
      },
      sort: true,
    },
    cell: (host) => {
      const agent = agents.find((a) => a.metadata?.uid === host.id);
      const infraEnvName = getInfraEnvNameOfAgent(agent);
      const title = infraEnvName ? (
        <Link
          to={`/multicloud/infrastructure/environments/details/${
            agent?.metadata?.namespace || ''
          }/${infraEnvName}/overview`}
        >
          {infraEnvName}
        </Link>
      ) : (
        '--'
      );
      return {
        title,
        props: { 'data-testid': 'infra-env' },
        sortableValue: infraEnvName,
      };
    },
  };
};
