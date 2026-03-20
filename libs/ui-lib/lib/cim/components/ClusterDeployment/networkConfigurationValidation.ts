import isCIDR from 'is-cidr';
import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';
import { NetworkConfigurationValues } from '../../../common/types/clusters';
import { isDualStack } from '../../../common/components/clusterConfiguration/utils';
import { DUAL_STACK, SINGLE_STACK, NETWORK_TYPE_OVN } from '../../../common/config';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkSettings: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksIpv6'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksIpv6'
    | 'serviceNetworksDualstack'
  >,
): NetworkConfigurationValues => {
  const managedNetworkingType = cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged';
  const isDualStackCluster = isDualStack(cluster);
  const primaryMachineCidr = cluster.machineNetworks?.[0]?.cidr;
  const isSingleStackIPv6 =
    !isDualStackCluster && primaryMachineCidr && isCIDR.v6(primaryMachineCidr);

  let clusterNetworks = cluster.clusterNetworks;
  if (!cluster.clusterNetworks?.length) {
    if (isDualStackCluster) {
      clusterNetworks = defaultNetworkSettings.clusterNetworksDualstack;
    } else if (isSingleStackIPv6) {
      clusterNetworks = defaultNetworkSettings.clusterNetworksIpv6;
    } else {
      clusterNetworks = defaultNetworkSettings.clusterNetworksIpv4;
    }
  }

  let serviceNetworks = cluster.serviceNetworks;
  if (!serviceNetworks?.length) {
    if (isDualStackCluster) {
      serviceNetworks = defaultNetworkSettings.serviceNetworksDualstack;
    } else if (isSingleStackIPv6) {
      serviceNetworks = defaultNetworkSettings.serviceNetworksIpv6;
    } else {
      serviceNetworks = defaultNetworkSettings.serviceNetworksIpv4;
    }
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
    stackType: isDualStackCluster ? DUAL_STACK : SINGLE_STACK,
  };
};
