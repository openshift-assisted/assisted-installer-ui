import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import { isDualStack } from '../../../common/components/clusterConfiguration/utils';
import { DUAL_STACK, IPV4_STACK, NETWORK_TYPE_OVN } from '../../../common/config';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkSettings: ClusterDefaultConfig,
): NetworkConfigurationValues => {
  const managedNetworkingType = cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged';
  const isDualStackCluster = isDualStack(cluster);

  let clusterNetworks = cluster.clusterNetworks;
  if (clusterNetworks === null || clusterNetworks === undefined || clusterNetworks.length === 0) {
    clusterNetworks = isDualStackCluster
      ? defaultNetworkSettings.clusterNetworksDualstack
      : defaultNetworkSettings.clusterNetworksIpv4;
  }

  let serviceNetworks = cluster.serviceNetworks;
  if (serviceNetworks === null || serviceNetworks === undefined || serviceNetworks.length === 0) {
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
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType,
    networkType: cluster.networkType || NETWORK_TYPE_OVN,
    stackType: isDualStackCluster ? DUAL_STACK : IPV4_STACK,
  };
};
