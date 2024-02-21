import { AgentStatus, getAgentStatusKey } from './status';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common/constants';

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
