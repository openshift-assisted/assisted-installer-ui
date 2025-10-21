import * as Yup from 'yup';
import {
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  HostSubnets,
  isDualStack,
  isSNO,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  serviceNetworkValidationSchema,
  IPv4ValidationSchema,
  sshPublicKeyListValidationSchema,
  IPV4_STACK,
  DUAL_STACK,
  vipArrayValidationSchema,
  NETWORK_TYPE_OVN,
} from '../../../../common';
import {
  ApiVip,
  Cluster,
  ClusterDefaultConfig,
  IngressVip,
} from '@openshift-assisted/types/assisted-installer-service';

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkValues: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >,
  isClusterManagedNetworkingUnsupported: boolean,
): NetworkConfigurationValues => {
  const isSNOCluster = isSNO(cluster);
  const isDualStackType = isDualStack({ ...cluster, openshiftVersion: cluster.openshiftVersion });

  return {
    apiVips: cluster.apiVips,
    ingressVips: cluster.ingressVips,
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType:
      cluster.platform?.type === 'none' ||
      (cluster.apiVips && cluster.apiVips.length === 0 && isClusterManagedNetworkingUnsupported) ||
      isSNOCluster
        ? 'userManaged'
        : 'clusterManaged',
    networkType: cluster.networkType || NETWORK_TYPE_OVN,
    machineNetworks: cluster.machineNetworks || [],
    stackType: isDualStackType ? DUAL_STACK : IPV4_STACK,
    clusterNetworks:
      cluster.clusterNetworks ||
      (isDualStackType
        ? defaultNetworkValues.clusterNetworksDualstack
        : defaultNetworkValues.clusterNetworksIpv4?.map((network) => ({
            ...network,
            clusterId: cluster.id,
          }))),
    serviceNetworks:
      cluster.serviceNetworks ||
      (isDualStackType
        ? defaultNetworkValues.serviceNetworksDualstack
        : defaultNetworkValues.serviceNetworksIpv4?.map((network) => ({
            ...network,
            clusterId: cluster.id,
          }))),
  };
};

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
  openshiftVersion?: string,
) =>
  Yup.lazy((values: NetworkConfigurationValues) =>
    Yup.object<NetworkConfigurationValues>().shape({
      apiVips: vipArrayValidationSchema<ApiVip>(hostSubnets, values, initialValues.apiVips),
      ingressVips: vipArrayValidationSchema<IngressVip>(
        hostSubnets,
        values,
        initialValues.ingressVips,
      ),
      sshPublicKey: sshPublicKeyListValidationSchema,
      machineNetworks:
        values.managedNetworkingType === 'userManaged'
          ? Yup.array()
          : machineNetworksValidationSchema.when('stackType', {
              is: (stackType: NetworkConfigurationValues['stackType']) => stackType === IPV4_STACK,
              then: () => machineNetworksValidationSchema.concat(IPv4ValidationSchema),
              otherwise: () =>
                values.machineNetworks && values.machineNetworks?.length >= 2
                  ? machineNetworksValidationSchema.concat(
                      dualStackValidationSchema('machine networks', openshiftVersion),
                    )
                  : Yup.array(),
            }),
      clusterNetworks: clusterNetworksValidationSchema.when('stackType', {
        is: (stackType: NetworkConfigurationValues['stackType']) => stackType === IPV4_STACK,
        then: () => clusterNetworksValidationSchema.concat(IPv4ValidationSchema),
        otherwise: () =>
          values.clusterNetworks && values.clusterNetworks?.length >= 2
            ? clusterNetworksValidationSchema.concat(
                dualStackValidationSchema('cluster network', openshiftVersion),
              )
            : Yup.array(),
      }),
      serviceNetworks: serviceNetworkValidationSchema.when('stackType', {
        is: (stackType: NetworkConfigurationValues['stackType']) => stackType === IPV4_STACK,
        then: () => serviceNetworkValidationSchema.concat(IPv4ValidationSchema),
        otherwise: () =>
          values.serviceNetworks && values.serviceNetworks?.length >= 2
            ? serviceNetworkValidationSchema.concat(
                dualStackValidationSchema('service network', openshiftVersion),
              )
            : Yup.array(),
      }),
    }),
  );
