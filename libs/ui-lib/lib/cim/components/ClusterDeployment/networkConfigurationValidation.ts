import * as Yup from 'yup';
import {
  Cluster,
  ClusterDefaultConfig,
} from '@openshift-assisted/types/assisted-installer-service';
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
} from '../../../common/components/clusterConfiguration/utils';
import {
  isSNO,
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectMachineNetworkCIDR,
  selectServiceNetworkCIDR,
} from '../../../common/selectors/clusterSelectors';
import { NETWORK_TYPE_OVN, NO_SUBNET_SET } from '../../../common/config';

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

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
) =>
  Yup.lazy<NetworkConfigurationValues>((values) =>
    Yup.object<NetworkConfigurationValues>().shape({
      clusterNetworkHostPrefix: hostPrefixValidationSchema(values.clusterNetworkCidr),
      clusterNetworkCidr: ipBlockValidationSchema(values.serviceNetworkCidr),
      serviceNetworkCidr: ipBlockValidationSchema(values.clusterNetworkCidr),
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
      hostSubnet: hostSubnetValidationSchema,
    }),
  );
