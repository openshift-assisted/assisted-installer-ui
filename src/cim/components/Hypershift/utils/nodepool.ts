import { AgentK8sResource } from '../../../types';
import { AgentMachineK8sResource, HostedClusterK8sResource, NodePoolK8sResource } from '../types';

export const getNodepoolAgents = (
  nodePool: NodePoolK8sResource,
  agents: AgentK8sResource[],
  agentMachines: AgentMachineK8sResource[],
  hostedCluster: HostedClusterK8sResource,
) => {
  const nodePoolAgentMachines = agentMachines
    .filter(
      (am) =>
        am.metadata?.labels?.[
          `${hostedCluster.metadata?.name || ''}-${hostedCluster.metadata?.namespace || ''}-${
            nodePool.metadata?.name || ''
          }`
        ] &&
        am.status?.agentRef?.name &&
        am.status?.agentRef?.namespace,
    )
    .reduce((acc, curr) => {
      acc[curr.status?.agentRef?.name || ''] = curr.status?.agentRef?.namespace;
      return acc;
    }, {});

  return agents.filter(
    (a) => nodePoolAgentMachines[a.metadata?.name || ''] === a.metadata?.namespace,
  );
};
