import { AgentStatus, getAgentStatusKey } from './status';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { AGENT_BMH_NAME_LABEL_KEY, INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common/constants';

const AGENT_FOR_SELECTION_STATUSES: AgentStatus[] = [
  'known',
  'known-unbound',
  'insufficient',
  'pending-for-input',
  'binding',
  'unbinding',
  'discovering',
  'reclaiming',
  'reclaiming-rebooting',
];

export const hostToAgent = (agents: AgentK8sResource[] = [], host: Host) =>
  agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;

export const getAgentsForSelection = (agents: AgentK8sResource[]) =>
  agents.filter((agent) => {
    const key = getAgentStatusKey(agent);
    return AGENT_FOR_SELECTION_STATUSES.includes(key as AgentStatus);
  });

export const getAgentRole = (agent: AgentK8sResource) => agent.spec.role || agent.status?.role;

export const getAgentProgress = (agent: AgentK8sResource) => agent.status?.progress;

export const getInfraEnvNameOfAgent = (resource?: AgentK8sResource | BareMetalHostK8sResource) =>
  resource?.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY];

export const getClusterNameOfAgent = (agent?: AgentK8sResource) =>
  agent?.spec?.clusterDeploymentName?.name;

type OnAgentChangeHostname<A = AgentK8sResource, B = BareMetalHostK8sResource> = (
  agents: A[],
  bmhs: B[],
  onChangeHostname: (agent: A, hostname: string) => Promise<unknown>,
  onChangeBMHHostname: (bmh: B, hostname: string) => Promise<unknown>,
) => (host: Host, hostname: string) => Promise<unknown>;

export const onAgentChangeHostname: OnAgentChangeHostname<
  AgentK8sResource,
  BareMetalHostK8sResource
> = (agents, bmhs, onChangeHostname, onChangeBMHHostname) => (host, hostname) => {
  const agent = agents.find((a) => a.metadata?.uid === host.id);
  let bmh: BareMetalHostK8sResource | undefined;
  if (agent) {
    const bmhName = agent.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY];
    if (!bmhName) {
      return onChangeHostname(agent, hostname);
    }
    // If Agent is backed by BMH, we need to update hostname on BMH
    bmh = bmhs.find(
      (bmh) =>
        bmh.metadata?.namespace === agent.metadata?.namespace && bmh.metadata?.name === bmhName,
    );
  } else {
    bmh = bmhs.find((bmh) => bmh.metadata?.uid === host.id);
  }
  return bmh ? onChangeBMHHostname(bmh, hostname) : Promise.resolve(undefined);
};
