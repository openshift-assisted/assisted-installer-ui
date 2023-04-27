import React, { PropsWithChildren } from 'react';
import {
  ActiveFeatureConfiguration,
  Cluster,
  CpuArchitecture,
  FeatureId,
  getDefaultCpuArchitecture,
  SupportLevel,
  SupportLevels,
} from '../../../common';
import { useOpenshiftVersions } from '../../hooks';
import {
  getNewFeatureDisabledReason,
  isFeatureSupportedAndAvailable,
} from './newFeatureStateUtils';
import useInfraEnv from '../../hooks/useInfraEnv';
import {
  NewFeatureSupportLevelContextProvider,
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
} from '../../../common/components/newFeatureSupportLevels';
import useSupportLevelsAPI from '../../hooks/useSupportLevelsAPI';
import { TFunction } from 'i18next';

export type NewSupportLevelProviderProps = PropsWithChildren<{
  clusterFeatureUsage?: string;
  openshiftVersion?: string;
  loadingUi: React.ReactNode;
  cluster?: Cluster;
  cpuArchitecture?: string;
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
}) => {
  const { loading: loadingOCPVersions } = useOpenshiftVersions();
  const { infraEnv, isLoading: isInfraEnvLoading } = useInfraEnv(
    cluster?.id || '',
    CpuArchitecture.USE_DAY1_ARCHITECTURE,
  );
  const featureSupportLevels = useSupportLevelsAPI('features', openshiftVersion, cpuArchitecture);

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
    (featureId: FeatureId, t?: TFunction, supportLevelDataNew?: NewFeatureSupportLevelMap) => {
      const isSupported = isFeatureSupportedCallback(featureId, supportLevelDataNew);
      return getNewFeatureDisabledReason(
        featureId,
        cluster,
        activeFeatureConfiguration,
        isSupported,
      );
    },
    [isFeatureSupportedCallback, cluster, activeFeatureConfiguration],
  );

  const isFeatureDisabled = React.useCallback(
    (featureId: FeatureId, supportLevelDataNew?: NewFeatureSupportLevelMap) =>
      !!getDisabledReasonCallback(featureId, undefined, supportLevelDataNew),
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
