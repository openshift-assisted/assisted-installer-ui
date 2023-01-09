import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types/k8s';
import { getClusterNameOfAgent } from './agents';

export const getIsSNOCluster = (agentClusterInstall?: AgentClusterInstallK8sResource) =>
  agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;

export const getAgentClusterInstallOfAgent = (
  agentClusterInstalls: AgentClusterInstallK8sResource[],
  agent?: AgentK8sResource,
) => {
  if (!agent) {
    return undefined;
  }

  const cdName = getClusterNameOfAgent(agent);
  if (!cdName) {
    return undefined;
  }

  return agentClusterInstalls.find((aci) => {
    const ownerReference = aci.metadata?.ownerReferences?.find(
      (or) => or.kind === 'ClusterDeployment' && or.name === cdName,
    );
    return !!ownerReference;
  });
};
