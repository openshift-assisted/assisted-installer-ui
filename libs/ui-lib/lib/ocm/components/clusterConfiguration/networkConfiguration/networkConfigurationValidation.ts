import * as Yup from 'yup';
import { TFunction } from 'i18next';
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
  sshPublicKeyValidationSchema,
  SINGLE_STACK,
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
  const isDualStackType = isDualStack(cluster);

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
    stackType: isDualStackType ? DUAL_STACK : SINGLE_STACK,
    clusterNetworks:
      cluster.clusterNetworks ||
      (isDualStackType
        ? defaultNetworkValues.clusterNetworksDualstack
        : defaultNetworkValues.clusterNetworksIpv4?.map((network) => ({
            ...network,
            clusterId: cluster?.id,
          }))),
    serviceNetworks:
      cluster.serviceNetworks ||
      (isDualStackType
        ? defaultNetworkValues.serviceNetworksDualstack
        : defaultNetworkValues.serviceNetworksIpv4?.map((network) => ({
            ...network,
            clusterId: cluster?.id,
          }))),
  };
};

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
  t: TFunction,
  openshiftVersion?: string,
) =>
  Yup.lazy((values: NetworkConfigurationValues) =>
    Yup.object<NetworkConfigurationValues>().shape({
      apiVips: vipArrayValidationSchema<ApiVip>(hostSubnets, values, t),
      ingressVips: vipArrayValidationSchema<IngressVip>(hostSubnets, values, t),
      sshPublicKey: sshPublicKeyValidationSchema(t),
      machineNetworks:
        values.managedNetworkingType === 'userManaged'
          ? Yup.array()
          : machineNetworksValidationSchema.when('stackType', {
              is: (stackType: NetworkConfigurationValues['stackType']) =>
                stackType === SINGLE_STACK,
              then: () => machineNetworksValidationSchema.concat(IPv4ValidationSchema),
              otherwise: () =>
                values.machineNetworks && values.machineNetworks?.length >= 2
                  ? machineNetworksValidationSchema.concat(
                      dualStackValidationSchema('machine networks', t, openshiftVersion),
                    )
                  : Yup.array(),
            }),
      clusterNetworks: clusterNetworksValidationSchema(t).when('stackType', {
        is: (stackType: NetworkConfigurationValues['stackType']) => stackType === SINGLE_STACK,
        then: (schema) => schema.concat(IPv4ValidationSchema),
        otherwise: (schema) =>
          schema.concat(dualStackValidationSchema('cluster network', t, openshiftVersion)),
      }),
      serviceNetworks: serviceNetworkValidationSchema(t).when('stackType', {
        is: (stackType: NetworkConfigurationValues['stackType']) => stackType === SINGLE_STACK,
        then: (schema) => schema.concat(IPv4ValidationSchema),
        otherwise: (schema) =>
          schema.concat(dualStackValidationSchema('service network', t, openshiftVersion)),
      }),
    }),
  );
