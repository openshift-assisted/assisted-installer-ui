import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../../types';
import { getAgentRole } from '../../helpers';
import { AgentRoleCounts } from '../types';

export const getAgentRoleCounts = (agents: AgentK8sResource[]): AgentRoleCounts =>
  agents.reduce<AgentRoleCounts>(
    (acc, agent) => {
      const role = getAgentRole(agent);

      switch (role) {
        case 'master':
          acc.master += 1;
          break;
        case 'arbiter':
          acc.arbiter += 1;
          break;
        case 'worker':
          acc.worker += 1;
          break;
        case 'auto-assign':
          acc.autoAssign += 1;
      }
      return acc;
    },
    { master: 0, arbiter: 0, worker: 0, autoAssign: 0 },
  );

export type ProvisionRequirements = NonNullable<
  AgentClusterInstallK8sResource['spec']
>['provisionRequirements'];

export const provisionRequirementsSatisfied = (
  counts: AgentRoleCounts,
  provisionRequirements: ProvisionRequirements | undefined,
): boolean => {
  const requiredMasters = provisionRequirements?.controlPlaneAgents || 0;
  const requiredArbiters = provisionRequirements?.arbiterAgents || 0;
  const { master, arbiter, worker, autoAssign } = counts;

  // Can't have more masters/arbiters than the cluster needs
  if (master > requiredMasters || arbiter > requiredArbiters) {
    return false;
  }

  // There must be enough auto-assign hosts
  const missingMasters = requiredMasters - master;
  const missingArbiters = requiredArbiters - arbiter;
  const enoughAutoAssingHosts = autoAssign >= missingMasters + missingArbiters;

  // SNO clusters must have exactly one master host
  if (requiredMasters === 1) {
    return enoughAutoAssingHosts && master + arbiter + worker + autoAssign === 1;
  }

  return enoughAutoAssingHosts;
};
