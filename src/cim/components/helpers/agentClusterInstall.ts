import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';

export const getIsSNOCluster = (agentClusterInstall: AgentClusterInstallK8sResource) =>
  agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;
