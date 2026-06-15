import { TFunction } from 'i18next';
import * as Yup from 'yup';
import { ApiVip, IngressVip } from '@openshift-assisted/types/assisted-installer-service';
import {
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  isPrimaryIPv6,
  HostSubnets,
  IPv4ValidationSchema,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  serviceNetworkValidationSchema,
  IPv6ValidationSchema,
  sshPublicKeyValidationSchema,
  SINGLE_STACK,
  vipArrayValidationSchema,
} from '../../../../../common';

export const getNetworkValidationSchema = (
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
