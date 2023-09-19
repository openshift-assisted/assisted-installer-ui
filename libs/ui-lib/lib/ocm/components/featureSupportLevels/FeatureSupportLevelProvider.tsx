import React, { PropsWithChildren } from 'react';
import {
  ActiveFeatureConfiguration,
  CpuArchitecture,
  FeatureId,
  SupportedCpuArchitecture,
  getDefaultCpuArchitecture,
} from '../../../common';
import { useOpenshiftVersions, usePullSecret } from '../../hooks';
import { getNewFeatureDisabledReason, isFeatureSupportedAndAvailable } from './featureStateUtils';
import useInfraEnv from '../../hooks/useInfraEnv';
import {
  NewFeatureSupportLevelContextProvider,
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
} from '../../../common/components/newFeatureSupportLevels';
import useSupportLevelsAPI from '../../hooks/useSupportLevelsAPI';
import {
  Cluster,
  PlatformType,
  SupportLevel,
  SupportLevels,
} from '@openshift-assisted/types/assisted-installer-service';

export type NewSupportLevelProviderProps = PropsWithChildren<{
  clusterFeatureUsage?: string;
  openshiftVersion?: string;
  loadingUi: React.ReactNode;
  cluster?: Cluster;
  cpuArchitecture?: CpuArchitecture;
  platformType?: PlatformType;
}>;

export const getFeatureSupported = (featureSupportLevels: SupportLevels, featureId: FeatureId) => {
  return featureSupportLevels && isFeatureSupportedAndAvailable(featureSupportLevels[featureId]);
};

export const NewFeatureSupportLevelProvider: React.FC<NewSupportLevelProviderProps> = ({
  cluster,
  children,
  loadingUi,
  cpuArchitecture,
  openshiftVersion,
  platformType,
}) => {
  const { loading: loadingOCPVersions } = useOpenshiftVersions();
  const pullSecret = usePullSecret();
  const { infraEnv, isLoading: isInfraEnvLoading } = useInfraEnv(
    cluster?.id || '',
    cluster?.cpuArchitecture
      ? (cluster.cpuArchitecture as CpuArchitecture)
      : CpuArchitecture.USE_DAY1_ARCHITECTURE,
    cluster?.name,
    pullSecret,
    cluster?.openshiftVersion,
  );
  const featureSupportLevels = useSupportLevelsAPI(
    'features',
    openshiftVersion,
    cpuArchitecture,
    platformType,
  );

  const supportLevelData = React.useMemo<NewFeatureSupportLevelMap>(() => {
    if (!featureSupportLevels) {
      return {} as NewFeatureSupportLevelMap;
    }
    return featureSupportLevels;
  }, [featureSupportLevels]);

  const isLoading = !supportLevelData || loadingOCPVersions || isInfraEnvLoading;

  const activeFeatureConfiguration = React.useMemo<ActiveFeatureConfiguration>(
    () => ({
      underlyingCpuArchitecture: (infraEnv?.cpuArchitecture ||
        cluster?.cpuArchitecture ||
        getDefaultCpuArchitecture()) as CpuArchitecture,
      hasStaticIpNetworking: !!infraEnv?.staticNetworkConfig,
    }),
    [cluster?.cpuArchitecture, infraEnv?.cpuArchitecture, infraEnv?.staticNetworkConfig],
  );

  const getFeatureSupportLevels = React.useCallback((): NewFeatureSupportLevelMap => {
    return supportLevelData;
  }, [supportLevelData]);

  const getFeatureSupportLevel = React.useCallback(
    (
      featureId: FeatureId,
      supportLevelDataNew?: NewFeatureSupportLevelMap,
    ): SupportLevel | undefined => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (supportLevelDataNew) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return supportLevelDataNew ? (supportLevelDataNew[featureId] as SupportLevel) : undefined;
      } else {
        if (supportLevelData) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return supportLevelData ? (supportLevelData[featureId] as SupportLevel) : undefined;
        }
      }
    },
    [supportLevelData],
  );

  const isFeatureSupportedCallback = React.useCallback(
    (featureId: FeatureId, supportLevelDataNew?: NewFeatureSupportLevelMap) => {
      const supportLevel = getFeatureSupportLevel(featureId, supportLevelDataNew);
      return isFeatureSupportedAndAvailable(supportLevel);
    },
    [getFeatureSupportLevel],
  );

  const getDisabledReasonCallback = React.useCallback(
    (
      featureId: FeatureId,
      supportLevelDataNew?: NewFeatureSupportLevelMap,
      cpuArchitecture?: SupportedCpuArchitecture,
      platformType?: PlatformType,
    ) => {
      const isSupported = isFeatureSupportedCallback(featureId, supportLevelDataNew);
      return getNewFeatureDisabledReason(
        featureId,
        cluster,
        activeFeatureConfiguration,
        isSupported,
        cpuArchitecture,
        platformType,
      );
    },
    [isFeatureSupportedCallback, cluster, activeFeatureConfiguration],
  );

  const isFeatureDisabled = React.useCallback(
    (featureId: FeatureId, supportLevelDataNew?: NewFeatureSupportLevelMap) =>
      !!getDisabledReasonCallback(featureId, supportLevelDataNew),
    [getDisabledReasonCallback],
  );

  const providerValue = React.useMemo<NewFeatureSupportLevelData>(() => {
    return {
      getFeatureSupportLevels: getFeatureSupportLevels,
      getFeatureSupportLevel: getFeatureSupportLevel,
      isFeatureDisabled: isFeatureDisabled,
      getFeatureDisabledReason: getDisabledReasonCallback,
      isFeatureSupported: isFeatureSupportedCallback,
      activeFeatureConfiguration,
    };
  }, [
    getFeatureSupportLevels,
    getFeatureSupportLevel,
    isFeatureDisabled,
    getDisabledReasonCallback,
    isFeatureSupportedCallback,
    activeFeatureConfiguration,
  ]);

  return (
    <NewFeatureSupportLevelContextProvider value={providerValue}>
      {isLoading ? loadingUi : children}
    </NewFeatureSupportLevelContextProvider>
  );
};

export default NewFeatureSupportLevelProvider;
