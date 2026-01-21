import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';
import { NetworkConfigurationValues } from '@openshift-assisted/common/types/clusters';
import {
  getSubnetFromMachineNetworkCidr,
  getHostSubnets,
} from '@openshift-assisted/common/components/clusterConfiguration/utils';
import {
  isSNO,
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectMachineNetworkCIDR,
  selectServiceNetworkCIDR,
} from '@openshift-assisted/common/selectors/clusterSelectors';
import { NETWORK_TYPE_OVN, NO_SUBNET_SET } from '@openshift-assisted/common/config/constants';

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

  return {
    clusterNetworkCidr:
      selectClusterNetworkCIDR(cluster) || defaultNetworkSettings.clusterNetworkCidr,
    clusterNetworkHostPrefix:
      selectClusterNetworkHostPrefix(cluster) || defaultNetworkSettings.clusterNetworkHostPrefix,
    serviceNetworkCidr:
      selectServiceNetworkCIDR(cluster) || defaultNetworkSettings.serviceNetworkCidr,
    apiVips: cluster.apiVips,
    ingressVips: cluster.ingressVips,
    sshPublicKey: cluster.sshPublicKey || '',
    hostSubnet: getInitHostSubnet(cluster, managedNetworkingType) || NO_SUBNET_SET,
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType,
    networkType: cluster.networkType || NETWORK_TYPE_OVN,
  };
};
