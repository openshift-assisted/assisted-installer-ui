import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';

type ConnectivityMajorityGroups = {
  l3_connected_addresses: object;
  majority_groups: { [key: string]: string[] };
};

export const getHostNetworks = (
  agents: AgentK8sResource[],
  agentClusterInstall?: AgentClusterInstallK8sResource,
) => {
  if (!agents?.length || !agentClusterInstall?.status?.connectivityMajorityGroups) {
    return [];
  }

  const connectivityMajorityGroups = JSON.parse(
    agentClusterInstall.status.connectivityMajorityGroups,
  ) as ConnectivityMajorityGroups;

  return Object.keys(connectivityMajorityGroups.majority_groups)
    .filter((k) => !['IPv4', 'IPv6'].includes(k))
    .map((cidr) => {
      const hostIds: string[] = [];

      connectivityMajorityGroups.majority_groups[cidr].forEach((hostName: string) => {
        const agent: AgentK8sResource | undefined = agents.find(
          (agent) => agent.metadata?.name === hostName,
        );
        if (!agent?.metadata?.uid) {
          // console.warn(`Can not find agent of ${hostName} name.`);
        } else {
          hostIds.push(agent.metadata.uid);
        }
      });

      return {
        cidr,
        hostIds,
      };
    });
};
