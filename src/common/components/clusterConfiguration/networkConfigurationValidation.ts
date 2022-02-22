import * as Yup from 'yup';
import { Cluster, ClusterNetwork, MachineNetwork, ServiceNetwork } from '../../api';
import { HostSubnets, NetworkConfigurationValues } from '../../types/clusters';
import {
  sshPublicKeyValidationSchema,
  vipValidationSchema,
  machineNetworksValidationSchema,
  clusterNetworksValidationSchema,
  serviceNetworkValidationSchema,
  dualStackValidationSchema,
  singleStackValidationSchema,
  uniqueSubnetValidationSchema,
} from '../ui';

import { getDefaultNetworkType, isSNO, isSubnetInIPv6 } from '../../selectors/clusterSelectors';
import { Address4, Address6 } from 'ip-address';

export const isSingleStack = (
  machineNetworks?: MachineNetwork[],
  clusterNetworks?: ClusterNetwork[],
  serviceNetworks?: ServiceNetwork[],
) =>
  (machineNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) ||
    machineNetworks?.every((network) => network.cidr && Address6.isValid(network.cidr))) &&
  (clusterNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) ||
    clusterNetworks?.every((network) => network.cidr && Address6.isValid(network.cidr))) &&
  (serviceNetworks?.every((network) => network.cidr && Address4.isValid(network.cidr)) ||
    serviceNetworks?.every((network) => network.cidr && Address6.isValid(network.cidr)));

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkValues: Partial<NetworkConfigurationValues>,
): NetworkConfigurationValues => {
  const managedNetworkingType = cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged';
  const isIPv6 = isSubnetInIPv6(cluster);
  const isSNOCluster = isSNO(cluster);

  return {
    apiVip: cluster.apiVip || '',
    ingressVip: cluster.ingressVip || '',
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType,
    networkType: cluster.networkType || getDefaultNetworkType(isSNOCluster, isIPv6),
    machineNetworks: cluster.machineNetworks,
    clusterNetworks: cluster.clusterNetworks || defaultNetworkValues.clusterNetworks,
    serviceNetworks: cluster.serviceNetworks || defaultNetworkValues.serviceNetworks,
    stackType: isIPv6 ? 'dualStack' : 'singleStack',
  };
};

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
) =>
  Yup.lazy<NetworkConfigurationValues>((values) =>
    Yup.object<NetworkConfigurationValues>().shape({
      apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      sshPublicKey: sshPublicKeyValidationSchema,
      machineNetworks:
        values.managedNetworkingType === 'userManaged'
          ? Yup.array()
          : machineNetworksValidationSchema.when('stackType', {
              is: 'singleStack',
              then: singleStackValidationSchema('machine networks').concat(
                uniqueSubnetValidationSchema('Machine'),
              ),
              otherwise:
                values.machineNetworks &&
                values.machineNetworks?.length >= 2 &&
                dualStackValidationSchema('machine networks'),
            }),
      clusterNetworks: clusterNetworksValidationSchema.when('stackType', {
        is: 'singleStack',
        then: singleStackValidationSchema('cluster network').concat(
          uniqueSubnetValidationSchema('Cluster'),
        ),
        otherwise:
          values.clusterNetworks &&
          values.clusterNetworks?.length >= 2 &&
          dualStackValidationSchema('cluster network'),
      }),
      serviceNetworks: serviceNetworkValidationSchema.when('stackType', {
        is: 'singleStack',
        then: singleStackValidationSchema('service networks').concat(
          uniqueSubnetValidationSchema('Service'),
        ),
        otherwise:
          values.serviceNetworks &&
          values.serviceNetworks?.length >= 2 &&
          dualStackValidationSchema('service network'),
      }),
    }),
  );
