import * as Yup from 'yup';
import { Cluster, ClusterDefaultConfig } from '../../api';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import {
  hostPrefixValidationSchema,
  hostSubnetValidationSchema,
  ipBlockValidationSchema,
  sshPublicKeyValidationSchema,
  vipValidationSchema,
} from '../ui';

import { getSubnetFromMachineNetworkCidr, getHostSubnets } from './utils';
import {
  getDefaultNetworkType,
  isSNO,
  isSubnetInIPv6,
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectMachineNetworkCIDR,
  selectServiceNetworkCIDR,
} from '../../selectors/clusterSelectors';
import { NO_SUBNET_SET } from '../../config';

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
      clusterNetworkCidr: ipBlockValidationSchema,
      serviceNetworkCidr: ipBlockValidationSchema,
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
      hostSubnet: hostSubnetValidationSchema,
    }),
  );
