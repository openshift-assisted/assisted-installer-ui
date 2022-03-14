import * as Yup from 'yup';
import { Address4, Address6 } from 'ip-address';
import {
  Cluster,
  ClusterNetwork,
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  HostSubnets,
  MachineNetwork,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  ServiceNetwork,
  serviceNetworkValidationSchema,
  singleStackValidationSchema,
  sshPublicKeyValidationSchema,
  uniqueSubnetValidationSchema,
  vipValidationSchema,
} from '../../../../common';

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
  return {
    apiVip: cluster.apiVip || '',
    ingressVip: cluster.ingressVip || '',
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType: cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged',
    networkType: cluster.networkType || 'OpenShiftSDN',
    enableProxy: false,
    editProxy: false,
    machineNetworks: cluster.machineNetworks,
    clusterNetworks: cluster.clusterNetworks || defaultNetworkValues.clusterNetworks,
    serviceNetworks: cluster.serviceNetworks || defaultNetworkValues.serviceNetworks,
    stackType: isSingleStack(
      cluster.machineNetworks || [],
      cluster.clusterNetworks || defaultNetworkValues.clusterNetworks,
      cluster.serviceNetworks || defaultNetworkValues.serviceNetworks,
    )
      ? 'singleStack'
      : 'dualStack',
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
