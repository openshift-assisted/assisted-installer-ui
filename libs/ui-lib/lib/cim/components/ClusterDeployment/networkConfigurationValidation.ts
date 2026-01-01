import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  getSubnetFromMachineNetworkCidr,
  getHostSubnets,
  isDualStack,
} from '../../../common/components/clusterConfiguration/utils';
import { isSNO, selectMachineNetworkCIDR } from '../../../common/selectors/clusterSelectors';
import { DUAL_STACK, IPV4_STACK, NETWORK_TYPE_OVN, NO_SUBNET_SET } from '../../../common/config';

const getInitHostSubnet = (
  cluster: Cluster,
  managedNetworkingType: 'userManaged' | 'clusterManaged',
) => {
  if (!isSNO(cluster) && managedNetworkingType === 'userManaged') {
    return NO_SUBNET_SET;
  }
  const machineNetworkCIDR = selectMachineNetworkCIDR(cluster);
  if (machineNetworkCIDR) {
    return getSubnetFromMachineNetworkCidr(machineNetworkCIDR);
  }
  if (managedNetworkingType === 'clusterManaged') {
    return getHostSubnets(cluster)?.[0]?.subnet;
  }
};

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkSettings: ClusterDefaultConfig,
): NetworkConfigurationValues => {
  const managedNetworkingType = cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged';
  const isDualStackCluster = isDualStack(cluster);

  let clusterNetworks = cluster.clusterNetworks;
  if (clusterNetworks == null || clusterNetworks.length === 0) {
    clusterNetworks = isDualStackCluster
      ? defaultNetworkSettings.clusterNetworksDualstack
      : defaultNetworkSettings.clusterNetworksIpv4;
  }

  let serviceNetworks = cluster.serviceNetworks;
  if (serviceNetworks == null || serviceNetworks.length === 0) {
    serviceNetworks = isDualStackCluster
      ? defaultNetworkSettings.serviceNetworksDualstack
      : defaultNetworkSettings.serviceNetworksIpv4;
  }

  const machineNetworks = cluster.machineNetworks || [];

  return {
    clusterNetworks,
    serviceNetworks,
    machineNetworks,
    apiVips: cluster.apiVips,
    ingressVips: cluster.ingressVips,
    sshPublicKey: cluster.sshPublicKey || '',
    hostSubnet: getInitHostSubnet(cluster, managedNetworkingType) || NO_SUBNET_SET,
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType,
    networkType: cluster.networkType || NETWORK_TYPE_OVN,
    stackType: isDualStackCluster ? DUAL_STACK : IPV4_STACK,
  };
};
