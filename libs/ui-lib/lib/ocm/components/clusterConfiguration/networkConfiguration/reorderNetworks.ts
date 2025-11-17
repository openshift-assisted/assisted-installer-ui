import { Address6 } from 'ip-address';
import { DUAL_STACK, NetworkConfigurationValues } from '../../../../common';
import type { FormikHelpers } from 'formik';

const reorderByPrimaryCidr = (
  primaryCidr: string,
  values: NetworkConfigurationValues,
  setFieldValue: FormikHelpers<NetworkConfigurationValues>['setFieldValue'],
) => {
  const isDualStack = values.stackType === DUAL_STACK;
  if (!isDualStack || !primaryCidr) return;

  const isPrimaryIPv6 = Address6.isValid(primaryCidr);

  // Reorder Cluster Networks
  if (Array.isArray(values.clusterNetworks) && values.clusterNetworks.length >= 2) {
    const [first, second] = values.clusterNetworks;
    const firstClusterCidr = first?.cidr;
    const secondClusterCidr = second?.cidr;
    if (firstClusterCidr && secondClusterCidr) {
      const isFirstClusterIPv6 = Address6.isValid(firstClusterCidr);
      const isSecondClusterIPv6 = Address6.isValid(secondClusterCidr);
      if (isFirstClusterIPv6 !== isSecondClusterIPv6) {
        if (
          (isPrimaryIPv6 && !isFirstClusterIPv6 && isSecondClusterIPv6) ||
          (!isPrimaryIPv6 && isFirstClusterIPv6 && !isSecondClusterIPv6)
        ) {
          const reordered = [values.clusterNetworks[1], values.clusterNetworks[0]];
          setFieldValue('clusterNetworks', reordered, false);
        }
      }
    }
  }

  // Reorder Service Networks
  if (Array.isArray(values.serviceNetworks) && values.serviceNetworks.length >= 2) {
    const [first, second] = values.serviceNetworks;
    const firstServiceCidr = first?.cidr;
    const secondServiceCidr = second?.cidr;
    if (firstServiceCidr && secondServiceCidr) {
      const isFirstServiceIPv6 = Address6.isValid(firstServiceCidr);
      const isSecondServiceIPv6 = Address6.isValid(secondServiceCidr);
      if (isFirstServiceIPv6 !== isSecondServiceIPv6) {
        if (
          (isPrimaryIPv6 && !isFirstServiceIPv6 && isSecondServiceIPv6) ||
          (!isPrimaryIPv6 && isFirstServiceIPv6 && !isSecondServiceIPv6)
        ) {
          const reordered = [values.serviceNetworks[1], values.serviceNetworks[0]];
          setFieldValue('serviceNetworks', reordered, false);
        }
      }
    }
  }
};

export const reorderNetworksForPrimary = (
  nextPrimaryCidr: string,
  values: NetworkConfigurationValues,
  setFieldValue: FormikHelpers<NetworkConfigurationValues>['setFieldValue'],
) => {
  if (!nextPrimaryCidr) return;
  reorderByPrimaryCidr(nextPrimaryCidr, values, setFieldValue);
};

export const reorderNetworksByCurrentPrimary = (
  values: NetworkConfigurationValues,
  setFieldValue: FormikHelpers<NetworkConfigurationValues>['setFieldValue'],
) => {
  const primaryCidr = values.machineNetworks?.[0]?.cidr;
  if (!primaryCidr) return;
  reorderByPrimaryCidr(primaryCidr, values, setFieldValue);
};
