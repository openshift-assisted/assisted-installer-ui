import * as Yup from 'yup';
import { Cluster, ClusterDefaultConfig } from '../../api';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import {
  hostPrefixValidationSchema,
  ipBlockValidationSchema,
  sshPublicKeyValidationSchema,
  vipValidationSchema,
} from '../ui';

import { getSubnetFromMachineNetworkCidr } from './utils';
import {
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectMachineNetworkCIDR,
  selectServiceNetworkCIDR,
} from '../../../ocm/selectors/clusterSelectors';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkSettings: ClusterDefaultConfig,
): NetworkConfigurationValues => {
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
    hostSubnet: getSubnetFromMachineNetworkCidr(selectMachineNetworkCIDR(cluster)),
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType: cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged',
    networkType: cluster.networkType || 'OpenShiftSDN',
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
    }),
  );
