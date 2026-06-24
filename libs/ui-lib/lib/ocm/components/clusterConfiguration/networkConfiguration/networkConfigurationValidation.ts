import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { Address6 } from 'ip-address';
import {
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  getIPv6FromDualstack,
  isPrimaryIPv6,
  HostSubnets,
  isDualStack,
  isSNO,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  serviceNetworkValidationSchema,
  IPv4ValidationSchema,
  IPv6ValidationSchema,
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
  const primaryMachineNetworkCidr = cluster.machineNetworks?.[0]?.cidr;
  const isIPv6OnlyStack =
    !isDualStackType && !!primaryMachineNetworkCidr && Address6.isValid(primaryMachineNetworkCidr);

  const getStackType = (): NetworkConfigurationValues['stackType'] => {
    if (isDualStackType) return DUAL_STACK;
    return SINGLE_STACK;
  };

  const getDefaultClusterNetworks = () => {
    if (isDualStackType) return defaultNetworkValues.clusterNetworksDualstack;
    if (isIPv6OnlyStack) {
      const ipv6Entry = getIPv6FromDualstack(defaultNetworkValues.clusterNetworksDualstack);
      return ipv6Entry ? [{ ...ipv6Entry, clusterId: cluster?.id }] : undefined;
    }
    return defaultNetworkValues.clusterNetworksIpv4?.map((network) => ({
      ...network,
      clusterId: cluster?.id,
    }));
  };

  const getDefaultServiceNetworks = () => {
    if (isDualStackType) return defaultNetworkValues.serviceNetworksDualstack;
    if (isIPv6OnlyStack) {
      const ipv6Entry = getIPv6FromDualstack(defaultNetworkValues.serviceNetworksDualstack);
      return ipv6Entry ? [{ ...ipv6Entry, clusterId: cluster?.id }] : undefined;
    }
    return defaultNetworkValues.serviceNetworksIpv4?.map((network) => ({
      ...network,
      clusterId: cluster?.id,
    }));
  };

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
    stackType: getStackType(),
    clusterNetworks: cluster.clusterNetworks || getDefaultClusterNetworks(),
    serviceNetworks: cluster.serviceNetworks || getDefaultServiceNetworks(),
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
              then: () => {
                if (isPrimaryIPv6(values.machineNetworks)) {
                  return machineNetworksValidationSchema.concat(IPv6ValidationSchema);
                }
                return machineNetworksValidationSchema.concat(IPv4ValidationSchema);
              },
              otherwise: () =>
                values.machineNetworks && values.machineNetworks?.length >= 2
                  ? machineNetworksValidationSchema.concat(
                      dualStackValidationSchema('machine networks', t, openshiftVersion),
                    )
                  : Yup.array(),
            }),
      clusterNetworks: clusterNetworksValidationSchema(t).when('stackType', {
        is: (stackType: NetworkConfigurationValues['stackType']) => stackType === SINGLE_STACK,
        then: (schema) => {
          if (isPrimaryIPv6(values.machineNetworks)) {
            return schema.concat(IPv6ValidationSchema);
          }
          return schema.concat(IPv4ValidationSchema);
        },
        otherwise: (schema) =>
          schema.concat(dualStackValidationSchema('cluster network', t, openshiftVersion)),
      }),
      serviceNetworks: serviceNetworkValidationSchema(t).when('stackType', {
        is: (stackType: NetworkConfigurationValues['stackType']) => stackType === SINGLE_STACK,
        then: (schema) => {
          if (isPrimaryIPv6(values.machineNetworks)) {
            return schema.concat(IPv6ValidationSchema);
          }
          return schema.concat(IPv4ValidationSchema);
        },
        otherwise: (schema) =>
          schema.concat(dualStackValidationSchema('service network', t, openshiftVersion)),
      }),
    }),
  );
