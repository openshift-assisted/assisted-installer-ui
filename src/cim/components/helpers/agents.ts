import { AgentStatus } from './status';
import { Host, HostStage } from '../../../common/api/types';
import { AgentK8sResource } from '../../types';
import { getAgentStatus } from './status';

const AGENT_FOR_SELECTION_STATUSES: AgentStatus[] = [
  'known',
  'known-unbound',
  'insufficient',
  'pending-for-input',
];

export const hostToAgent = (agents: AgentK8sResource[] = [], host: Host) =>
  agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;

export const getAgentsForSelection = (agents: AgentK8sResource[]) =>
  agents.filter((agent) => {
    const [status] = getAgentStatus(agent);
    return AGENT_FOR_SELECTION_STATUSES.includes(status);
  });

export const getAgentRole = (agent: AgentK8sResource) => agent.spec.role || agent.status?.role;

// NOTE: based host stages defined in https://github.com/openshift/assisted-service/blob/master/internal/host/host.go
// TODO(jtomasek): Use this until agent resource does not expose host.progressStages array
export const getAgentProgressStages = (agent: AgentK8sResource): HostStage[] => {
  const isBootstrap = agent.status?.bootstrap;
  const role = getAgentRole(agent);

  const bootstrapHostStages: HostStage[] = [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Waiting for control plane',
    'Waiting for bootkube',
    'Waiting for controller',
    'Rebooting',
    'Configuring',
    'Joined',
    'Done',
  ];

  const masterHostStages: HostStage[] = [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Rebooting',
    'Configuring',
    'Joined',
    'Done',
  ];

  const workerHostStages: HostStage[] = [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Waiting for control plane',
    'Rebooting',
    'Waiting for ignition',
    'Configuring',
    'Joined',
    'Done',
  ];

  if (isBootstrap) return bootstrapHostStages;
  if (role === 'master') return masterHostStages;
  if (role === 'worker') return workerHostStages;
  return [];
};

export const getAgentProgress = (agent: AgentK8sResource) => agent.status?.progress;
