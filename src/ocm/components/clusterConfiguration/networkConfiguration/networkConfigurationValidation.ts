import * as Yup from 'yup';
import {
  allSubnetsIPv4,
  Cluster,
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  getDefaultNetworkType,
  HostSubnets,
  isSingleStack,
  isSNO,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  serviceNetworkValidationSchema,
  singleStackValidationSchema,
  sshPublicKeyValidationSchema,
  vipValidationSchema,
} from '../../../../common';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkValues: Partial<NetworkConfigurationValues>,
): NetworkConfigurationValues => {
  const isSNOCluster = isSNO(cluster);
  const usesIPv6 = !(
    allSubnetsIPv4(cluster.machineNetworks) &&
    allSubnetsIPv4(cluster.clusterNetworks) &&
    allSubnetsIPv4(cluster.serviceNetworks)
  );

  return {
    apiVip: cluster.apiVip || '',
    ingressVip: cluster.ingressVip || '',
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType: cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged',
    networkType: cluster.networkType || getDefaultNetworkType(isSNOCluster, usesIPv6),
    enableProxy: false,
    editProxy: false,
    machineNetworks: cluster.machineNetworks || [],
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
              then: singleStackValidationSchema(
                values.clusterNetworks || [],
                values.serviceNetworks || [],
              ),
              otherwise:
                values.machineNetworks &&
                values.machineNetworks?.length >= 2 &&
                dualStackValidationSchema('machine networks'),
            }),
      clusterNetworks: clusterNetworksValidationSchema.when('stackType', {
        is: 'singleStack',
        then: singleStackValidationSchema(
          values.machineNetworks || [],
          values.serviceNetworks || [],
        ),
        otherwise:
          values.clusterNetworks &&
          values.clusterNetworks?.length >= 2 &&
          dualStackValidationSchema('cluster network'),
      }),
      serviceNetworks: serviceNetworkValidationSchema.when('stackType', {
        is: 'singleStack',
        then: singleStackValidationSchema(
          values.machineNetworks || [],
          values.clusterNetworks || [],
        ),
        otherwise:
          values.serviceNetworks &&
          values.serviceNetworks?.length >= 2 &&
          dualStackValidationSchema('service network'),
      }),
    }),
  );
