import isMatch from 'lodash/isMatch';
import { AgentK8sResource } from '../../types';
import { NodePoolK8sResource } from './types';

export const getNodepoolAgents = (nodePool: NodePoolK8sResource, agents: AgentK8sResource[]) => {
  const labelMatchingAgents = agents.filter((a) =>
    a.metadata?.labels
      ? isMatch(a.metadata.labels, nodePool.spec.platform.agent.agentLabelSelector.matchLabels)
      : false,
  );

  const sortedAgents = labelMatchingAgents.sort((a, b) => {
    const aHasCD =
      a.spec.clusterDeploymentName?.name === nodePool.spec.clusterName &&
      a.spec.clusterDeploymentName?.namespace ===
        `${nodePool.metadata?.namespace || ''}-${nodePool.metadata?.name || ''}`;
    const bHasCD =
      b.spec.clusterDeploymentName?.name === nodePool.spec.clusterName &&
      b.spec.clusterDeploymentName?.namespace ===
        `${nodePool.metadata?.namespace || ''}-${nodePool.metadata?.name || ''}`;

    if (aHasCD && !bHasCD) {
      return 1;
    }
    if (bHasCD && !aHasCD) {
      return -1;
    }
    return 0;
  });

  return sortedAgents.slice(0, nodePool.spec.replicas);
};
