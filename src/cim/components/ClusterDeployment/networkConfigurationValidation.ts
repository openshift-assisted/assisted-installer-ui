import * as Yup from 'yup';
import { Cluster, ClusterDefaultConfig } from '../../../common/api';
import { HostSubnets, NetworkConfigurationValues } from '../../../common/types/clusters';
import {
  hostPrefixValidationSchema,
  hostSubnetValidationSchema,
  ipBlockValidationSchema,
  sshPublicKeyValidationSchema,
  vipValidationSchema,
} from '../../../common/components/ui';

import {
  getSubnetFromMachineNetworkCidr,
  getHostSubnets,
  isSubnetInIPv6,
  getDefaultNetworkType,
} from '../../../common/components/clusterConfiguration/utils';
import {
  isSNO,
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectMachineNetworkCIDR,
  selectServiceNetworkCIDR,
} from '../../../common/selectors/clusterSelectors';
import { NO_SUBNET_SET } from '../../../common/config';

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
  const isIPv6 = isSubnetInIPv6(cluster);
  const isSNOCluster = isSNO(cluster);

  return {
    clusterNetworkCidr:
      selectClusterNetworkCIDR(cluster) || defaultNetworkSettings.clusterNetworkCidr,
    clusterNetworkHostPrefix:
      selectClusterNetworkHostPrefix(cluster) || defaultNetworkSettings.clusterNetworkHostPrefix,
    serviceNetworkCidr:
      selectServiceNetworkCIDR(cluster) || defaultNetworkSettings.serviceNetworkCidr,
    apiVip: cluster.apiVip || '',
    ingressVip: cluster.ingressVip || '',
    sshPublicKey: cluster.sshPublicKey || '',
    hostSubnet: getInitHostSubnet(cluster, managedNetworkingType) || NO_SUBNET_SET,
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType,
    networkType: cluster.networkType || getDefaultNetworkType(isSNOCluster, isIPv6),
  };
};

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
) =>
  Yup.lazy<NetworkConfigurationValues>((values) =>
    Yup.object<NetworkConfigurationValues>().shape({
      clusterNetworkHostPrefix: hostPrefixValidationSchema(values),
      clusterNetworkCidr: ipBlockValidationSchema(values.serviceNetworkCidr),
      serviceNetworkCidr: ipBlockValidationSchema(values.clusterNetworkCidr),
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
      hostSubnet: hostSubnetValidationSchema,
    }),
  );
