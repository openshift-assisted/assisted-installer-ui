import _ from 'lodash';
import { AgentK8sResource } from '../../types/k8s/agent';
import { Cluster, Host, Inventory } from '../../../common/api/types';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { getAgentStatus, getClusterStatus } from './status';
import { getHostNetworks } from './network';
import { BareMetalHostK8sResource, InfraEnvK8sResource } from '../../types';
import { AGENT_BMH_HOSTNAME_LABEL_KEY, BMH_HOSTNAME_ANNOTATION } from '../common/constants';
import { getAgentProgress, getAgentRole, getInfraEnvNameOfAgent } from './agents';

export const getAIHosts = (
  agents: AgentK8sResource[],
  bmhs?: BareMetalHostK8sResource[],
  infraEnv?: InfraEnvK8sResource,
) => {
  const bmhAgents: string[] = [];
  const hosts = agents.map(
    (agent): Host => {
      const { status } = getAgentStatus(agent, true);
      const statusInfo = agent.status?.debugInfo?.stateInfo || '';
      // TODO(mlibra) Remove that workaround once https://issues.redhat.com/browse/MGMT-7052 is fixed
      const inventory: Inventory = _.cloneDeep(agent.status?.inventory || {});
      inventory.interfaces?.forEach((intf) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        intf.ipv4Addresses = _.cloneDeep(intf.ipV4Addresses);
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        intf.ipv6Addresses = _.cloneDeep(intf.ipV6Addresses);
      });

      if (agent.metadata?.labels?.[AGENT_BMH_HOSTNAME_LABEL_KEY]) {
        const bmhName = agent.metadata?.labels?.[AGENT_BMH_HOSTNAME_LABEL_KEY];
        bmhAgents.push(bmhName);
        const bmh = bmhs?.find(
          (h) =>
            h.metadata?.name === bmhName && h.metadata?.namespace === agent.metadata?.namespace,
        );
        if (bmh?.spec?.bmc?.address) {
          inventory.bmcAddress = bmh.spec.bmc.address;
        }
      }

      const agentProgress = getAgentProgress(agent);
      return {
        kind: 'Host',
        id: agent.metadata?.uid || '',
        href: '',
        status: status as Host['status'],
        statusInfo,
        role: getAgentRole(agent),
        requestedHostname: agent.spec.hostname || inventory.hostname,
        createdAt: agent.metadata?.creationTimestamp,
        validationsInfo: JSON.stringify(agent.status?.validationsInfo || {}),
        inventory: JSON.stringify(inventory),
        progress: agentProgress && {
          currentStage: agentProgress.currentStage,
          installationPercentage: agentProgress.installationPercentage,
          progressInfo: agentProgress.progressInfo,
          stageStartedAt: agentProgress.stageStartTime,
          stageUpdatedAt: agentProgress.stageUpdateTime,
        },
        progressStages: agentProgress?.progressStages,
        bootstrap: agent.status?.bootstrap,
      };
    },
  );

  const restBmhs =
    infraEnv && bmhs
      ? bmhs
          ?.filter((h) =>
            h.metadata?.namespace === infraEnv.metadata?.namespace &&
            getInfraEnvNameOfAgent(h) === infraEnv.metadata?.name &&
            h.metadata?.name
              ? !bmhAgents.includes(h.metadata.name)
              : true,
          )
          .map((h) => {
            const hostInventory: Inventory = {
              hostname: h.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || h.metadata?.name,
              bmcAddress: h.spec?.bmc?.address,
              systemVendor: {
                virtual: false,
                productName: 'Bare Metal Host',
              },
            };

            const restBmh: Host = {
              id: h.metadata?.uid || '',
              href: '',
              kind: 'Host', // It's BMC
              status: 'known',
              statusInfo: '',
              inventory: JSON.stringify(hostInventory),
              requestedHostname:
                h.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || h.metadata?.name,
              role: undefined,
              createdAt: h.metadata?.creationTimestamp,
            };

            return restBmh;
          })
      : [];

  return [...hosts, ...restBmhs];
};

export const getAICluster = ({
  clusterDeployment,
  agentClusterInstall,
  agents = [],
}: {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
}): Cluster => {
  const [status, statusInfo] = getClusterStatus(agentClusterInstall);
  const aiCluster: Cluster = {
    id: clusterDeployment.metadata?.uid || '',
    kind: 'Cluster',
    href: '',
    name: clusterDeployment.spec?.clusterName,
    baseDnsDomain: clusterDeployment.spec?.baseDomain,
    openshiftVersion: agentClusterInstall?.spec?.imageSetRef?.name,
    apiVip: agentClusterInstall?.spec?.apiVIP,
    ingressVip: agentClusterInstall?.spec?.ingressVIP,
    highAvailabilityMode:
      agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1 ? 'None' : 'Full',
    status,
    statusInfo,
    imageInfo: {
      sshPublicKey: agentClusterInstall?.spec?.sshPublicKey,
    },
    sshPublicKey: agentClusterInstall?.spec?.sshPublicKey,
    clusterNetworkHostPrefix:
      agentClusterInstall?.spec?.networking?.clusterNetwork?.[0]?.hostPrefix,
    clusterNetworkCidr: agentClusterInstall?.spec?.networking?.clusterNetwork?.[0]?.cidr,
    serviceNetworkCidr: agentClusterInstall?.spec?.networking?.serviceNetwork?.[0],
    machineNetworkCidr:
      agentClusterInstall?.status?.machineNetwork?.[0]?.cidr ||
      agentClusterInstall?.spec?.networking?.machineNetwork?.[0]?.cidr,
    monitoredOperators: [],
    vipDhcpAllocation: false,
    userManagedNetworking:
      agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1,
    hostNetworks: getHostNetworks(agents, agentClusterInstall),
    totalHostCount: agents?.length,
    hosts: getAIHosts(agents),
    installStartedAt: clusterDeployment.status?.installStartedTimestamp,
    installCompletedAt: clusterDeployment.status?.installedTimestamp,
    validationsInfo: JSON.stringify(agentClusterInstall?.status?.validationsInfo || {}),
  };
  /*
  aiCluster.agentSelectorMasterLabels =
    clusterDeployment.spec?.platform?.agentBareMetal?.agentSelector?.matchLabels;

  // TODO(mlibra): Where to store that in K8S resources?
  //
  // Initial value of the "Auto-select control plane (master) hosts" switch
  // is driven by either undefined or actual value of agentSelectorWorkerLabels
  aiCluster.agentSelectorWorkerLabels = undefined;
*/
  return aiCluster;
};
