import {
  ClusterDefaultConfig,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  getIPv6FromDualstack,
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
} from '../../../../../../common';

export const getManagedNetworkingDisabledReason = (
  isDualStack: boolean,
  isOracleCloudInfrastructure: boolean,
  featureSupportLevelData: NewFeatureSupportLevelData,
) => {
  if (isOracleCloudInfrastructure) {
    return 'Network management selection is not supported with Oracle Cloud Infrastructure';
  } else if (isDualStack) {
    return 'Network management selection is not supported with dual-stack';
  } else if (featureSupportLevelData.isFeatureDisabled('NETWORK_TYPE_SELECTION')) {
    return featureSupportLevelData.getFeatureDisabledReason('NETWORK_TYPE_SELECTION');
  }
};

export const getUserManagedDisabledReason = (
  featureSupportLevelContext: NewFeatureSupportLevelData,
  platformType?: PlatformType,
  featureSupportLevelMap?: NewFeatureSupportLevelMap | null,
) => {
  if (!featureSupportLevelContext.isFeatureSupported('USER_MANAGED_NETWORKING')) {
    return featureSupportLevelContext.getFeatureDisabledReason(
      'USER_MANAGED_NETWORKING',
      featureSupportLevelMap ?? undefined,
      undefined,
      platformType,
    );
  }
};

export const getClusterManagedDisabledReason = (
  featureSupportLevelContext: NewFeatureSupportLevelData,
  featureSupportLevelMap?: NewFeatureSupportLevelMap | null,
) => {
  if (!featureSupportLevelContext.isFeatureSupported('CLUSTER_MANAGED_NETWORKING')) {
    return featureSupportLevelContext.getFeatureDisabledReason(
      'CLUSTER_MANAGED_NETWORKING',
      featureSupportLevelMap ?? undefined,
    );
  }
};

export const getManagedNetworkingState = (
  isDualStack: boolean,
  isOracleCloudInfrastructure: boolean,
  featureSupportLevelData: NewFeatureSupportLevelData,
  platformType?: PlatformType,
  featureSupportLevelMap?: NewFeatureSupportLevelMap | null,
): {
  isDisabled: boolean;
  clusterManagedDisabledReason?: string;
  userManagedDisabledReason?: string;
} => {
  const networkingReason = getManagedNetworkingDisabledReason(
    isDualStack,
    isOracleCloudInfrastructure,
    featureSupportLevelData,
  );
  const cmnReason = getClusterManagedDisabledReason(
    featureSupportLevelData,
    featureSupportLevelMap,
  );
  const umnReason = getUserManagedDisabledReason(
    featureSupportLevelData,
    platformType,
    featureSupportLevelMap,
  );

  return {
    isDisabled: !!(cmnReason || umnReason || networkingReason),
    clusterManagedDisabledReason: cmnReason || networkingReason,
    userManagedDisabledReason: umnReason || networkingReason,
  };
};

type DefaultNetworkSettings = Pick<
  ClusterDefaultConfig,
  | 'clusterNetworksIpv4'
  | 'clusterNetworksDualstack'
  | 'serviceNetworksIpv4'
  | 'serviceNetworksDualstack'
>;

export const getNetworkDefaultsByFamily = (
  settings: DefaultNetworkSettings,
  isDualStack: boolean,
  isIPv6: boolean,
) => {
  if (isDualStack) {
    return {
      clusterNetworkDefaults: settings.clusterNetworksDualstack,
      serviceNetworkDefaults: settings.serviceNetworksDualstack,
    };
  }
  if (isIPv6) {
    const ipv6Cluster = getIPv6FromDualstack(settings.clusterNetworksDualstack);
    const ipv6Service = getIPv6FromDualstack(settings.serviceNetworksDualstack);
    return {
      clusterNetworkDefaults: ipv6Cluster ? [ipv6Cluster] : settings.clusterNetworksIpv4,
      serviceNetworkDefaults: ipv6Service ? [ipv6Service] : settings.serviceNetworksIpv4,
    };
  }
  return {
    clusterNetworkDefaults: settings.clusterNetworksIpv4,
    serviceNetworkDefaults: settings.serviceNetworksIpv4,
  };
};
