import { Host } from '../../../common';
import { AgentK8sResource } from '../../types';

export const hostToAgent = (agents: AgentK8sResource[] = [], host: Host) =>
  agents.find((a) => a.metadata?.uid === host.id) as AgentK8sResource;
