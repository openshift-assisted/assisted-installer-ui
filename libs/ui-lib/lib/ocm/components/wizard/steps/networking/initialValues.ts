import { Address6 } from 'ip-address';
import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  isDualStack,
  isSNO,
  NetworkConfigurationValues,
  SINGLE_STACK,
  DUAL_STACK,
  NETWORK_TYPE_OVN,
  getIPv6FromDualstack,
} from '../../../../../common';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkValues: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >,
  isClusterManagedNetworkingUnsupported: boolean,
): NetworkConfigurationValues => {
  const isSNOCluster = isSNO(cluster);
  const isDualStackType = isDualStack(cluster);
  const primaryMachineNetworkCidr = cluster.machineNetworks?.[0]?.cidr;
  const isIPv6OnlyStack =
    !isDualStackType && !!primaryMachineNetworkCidr && Address6.isValid(primaryMachineNetworkCidr);

  const getStackType = (): NetworkConfigurationValues['stackType'] => {
    if (isDualStackType) return DUAL_STACK;
    return SINGLE_STACK;
  };

  const getDefaultClusterNetworks = () => {
    if (isDualStackType) return defaultNetworkValues.clusterNetworksDualstack;
    if (isIPv6OnlyStack) {
      const ipv6Entry = getIPv6FromDualstack(defaultNetworkValues.clusterNetworksDualstack);
      return ipv6Entry ? [{ ...ipv6Entry, clusterId: cluster?.id }] : undefined;
    }
    return defaultNetworkValues.clusterNetworksIpv4?.map((network) => ({
      ...network,
      clusterId: cluster?.id,
    }));
  };

  const getDefaultServiceNetworks = () => {
    if (isDualStackType) return defaultNetworkValues.serviceNetworksDualstack;
    if (isIPv6OnlyStack) {
      const ipv6Entry = getIPv6FromDualstack(defaultNetworkValues.serviceNetworksDualstack);
      return ipv6Entry ? [{ ...ipv6Entry, clusterId: cluster?.id }] : undefined;
    }
    return defaultNetworkValues.serviceNetworksIpv4?.map((network) => ({
      ...network,
      clusterId: cluster?.id,
    }));
  };

  return {
    apiVips: cluster.apiVips,
    ingressVips: cluster.ingressVips,
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType:
      cluster.platform?.type === 'none' ||
      (cluster.apiVips && cluster.apiVips.length === 0 && isClusterManagedNetworkingUnsupported) ||
      isSNOCluster
        ? 'userManaged'
        : 'clusterManaged',
    networkType: cluster.networkType || NETWORK_TYPE_OVN,
    machineNetworks: cluster.machineNetworks || [],
    stackType: getStackType(),
    clusterNetworks: cluster.clusterNetworks || getDefaultClusterNetworks(),
    serviceNetworks: cluster.serviceNetworks || getDefaultServiceNetworks(),
  };
};
