import * as Yup from 'yup';
import {
  Cluster,
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  getDefaultNetworkType,
  HostSubnets,
  isDualStack,
  isSNO,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  serviceNetworkValidationSchema,
  IPv4ValidationSchema,
  sshPublicKeyValidationSchema,
  vipValidationSchema,
  IPV4_STACK,
  DUAL_STACK,
  ClusterDefaultConfig,
} from '../../../../common';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkValues: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >,
): NetworkConfigurationValues => {
  const isSNOCluster = isSNO(cluster);
  const isDualStackType = isDualStack(cluster);

  return {
    apiVip: cluster.apiVip || '',
    ingressVip: cluster.ingressVip || '',
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType: cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged',
    networkType: cluster.networkType || getDefaultNetworkType(isSNOCluster, isDualStackType),
    machineNetworks: cluster.machineNetworks || [],
    stackType: isDualStackType ? DUAL_STACK : IPV4_STACK,
    clusterNetworks:
      cluster.clusterNetworks ||
      (isDualStackType
        ? defaultNetworkValues.clusterNetworksDualstack
        : defaultNetworkValues.clusterNetworksIpv4),
    serviceNetworks:
      cluster.serviceNetworks ||
      (isDualStackType
        ? defaultNetworkValues.serviceNetworksDualstack
        : defaultNetworkValues.serviceNetworksIpv4),
  };
};

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
) =>
  Yup.lazy<NetworkConfigurationValues>((values) =>
    Yup.object<NetworkConfigurationValues>().shape({
      apiVip:
        values.apiVip !== undefined && values.apiVip !== ''
          ? vipValidationSchema(hostSubnets, values, initialValues.apiVip)
          : Yup.string(),
      ingressVip:
        values.ingressVip !== undefined && values.ingressVip !== ''
          ? vipValidationSchema(hostSubnets, values, initialValues.ingressVip)
          : Yup.string(),
      sshPublicKey: sshPublicKeyValidationSchema,
      machineNetworks:
        values.managedNetworkingType === 'userManaged'
          ? Yup.array()
          : machineNetworksValidationSchema.when('stackType', {
              is: IPV4_STACK,
              then: IPv4ValidationSchema,
              otherwise:
                values.machineNetworks &&
                values.machineNetworks?.length >= 2 &&
                dualStackValidationSchema('machine networks'),
            }),
      clusterNetworks: clusterNetworksValidationSchema.when('stackType', {
        is: IPV4_STACK,
        then: IPv4ValidationSchema,
        otherwise:
          values.clusterNetworks &&
          values.clusterNetworks?.length >= 2 &&
          dualStackValidationSchema('cluster network'),
      }),
      serviceNetworks: serviceNetworkValidationSchema.when('stackType', {
        is: IPV4_STACK,
        then: IPv4ValidationSchema,
        otherwise:
          values.serviceNetworks &&
          values.serviceNetworks?.length >= 2 &&
          dualStackValidationSchema('service network'),
      }),
    }),
  );
