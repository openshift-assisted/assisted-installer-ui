import { AgentStatus, getAgentStatusKey } from './status';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import {
  AGENT_BMH_NAME_LABEL_KEY,
  BMH_HOSTNAME_ANNOTATION,
  INFRAENV_AGENTINSTALL_LABEL_KEY,
} from '../common/constants';
import { appendPatch } from '../../utils';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { AgentModel, BMHModel } from '../../types/models';

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
) => (host: Host, hostname: string) => Promise<unknown>;

export const onAgentChangeHostname: OnAgentChangeHostname<
  AgentK8sResource,
  BareMetalHostK8sResource
> = (agents, bmhs) => (host, hostname) => {
  const agent = agents.find((a) => a.metadata?.uid === host.id);
  let bmh: BareMetalHostK8sResource | undefined;
  if (agent) {
    const bmhName = agent.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY];
    if (!bmhName) {
      const patches: Patch[] = [];
      appendPatch(patches, '/spec/hostname', hostname, agent.spec?.hostname);
      return k8sPatch({ model: AgentModel, resource: agent, data: patches });
    }
    // If Agent is backed by BMH, we need to update hostname on BMH
    bmh = bmhs.find(
      (bmh) =>
        bmh.metadata?.namespace === agent.metadata?.namespace && bmh.metadata?.name === bmhName,
    );
  } else {
    bmh = bmhs.find((bmh) => bmh.metadata?.uid === host.id);
  }

  if (!bmh) {
    return Promise.resolve(undefined);
  }

  const patches: Patch[] = [];
  const prevHostname = bmh.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || '';
  appendPatch(
    patches,
    `/metadata/annotations/${BMH_HOSTNAME_ANNOTATION.replace('/', '~1')}`,
    hostname,
    prevHostname,
  );
  return k8sPatch({ model: BMHModel, resource: bmh, data: patches });
};
