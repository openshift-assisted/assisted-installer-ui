import useSWR from 'swr';
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
import { handleApiError } from '../../api';
import { useOpenshiftVersions } from '../../hooks';
import { getNewFeatureDisabledReason, isFeatureSupported } from './newFeatureStateUtils';
import useInfraEnv from '../../hooks/useInfraEnv';
import {
  NewFeatureSupportLevelContextProvider,
  NewFeatureSupportLevelData,
} from '../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelsAPI from '../../services/apis/NewFeatureSupportLevelsAPI';

export type NewSupportLevelProviderProps = PropsWithChildren<{
  clusterFeatureUsage?: string;
  openshiftVersion?: string;
  loadingUi: React.ReactNode;
  cluster?: Cluster;
}>;

export const getFeatureSupported = (featureSupportLevels: SupportLevels, featureId: FeatureId) => {
  return featureSupportLevels && featureSupportLevels[featureId] !== 'unsupported';
};

export const NewFeatureSupportLevelProvider: React.FC<NewSupportLevelProviderProps> = ({
  cluster,
  children,
  loadingUi,
}) => {
  /*const {
    values: { openshiftVersion, cpuArchitecture },
  } = useFormikContext<ClusterCreateParams>();*/
  const { loading: loadingOCPVersions } = useOpenshiftVersions();
  const { infraEnv, isLoading: isInfraEnvLoading } = useInfraEnv(
    cluster?.id || '',
    CpuArchitecture.USE_DAY1_ARCHITECTURE,
  );

  const fetcher = () =>
    NewFeatureSupportLevelsAPI.featuresSupportLevel('4.12', 'x86_64').then((res) => res.data);
  const { data: featureSupportLevels, error } = useSWR<SupportLevels, unknown>(
    NewFeatureSupportLevelsAPI.makeBaseURI(),
    fetcher,
    { errorRetryCount: 0, revalidateOnFocus: false },
  );
  const isLoading = (!featureSupportLevels && !error) || loadingOCPVersions || isInfraEnvLoading;

  const supportLevelData = React.useMemo<SupportLevels>(() => {
    if (!featureSupportLevels || error) {
      return {};
    }
    return featureSupportLevels;
  }, [error, featureSupportLevels]);

  const activeFeatureConfiguration = React.useMemo<ActiveFeatureConfiguration>(
    () => ({
      underlyingCpuArchitecture: (infraEnv?.cpuArchitecture ||
        cluster?.cpuArchitecture ||
        getDefaultCpuArchitecture()) as CpuArchitecture,
      hasStaticIpNetworking: !!infraEnv?.staticNetworkConfig,
    }),
    [cluster?.cpuArchitecture, infraEnv?.cpuArchitecture, infraEnv?.staticNetworkConfig],
  );

  const getFeatureSupportLevels = React.useCallback((): SupportLevels => {
    return supportLevelData;
  }, [supportLevelData]);

  const getFeatureSupportLevel = React.useCallback(
    (featureId: FeatureId): SupportLevel | undefined => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return supportLevelData
        ? (supportLevelData.features[featureId.toLowerCase()] as SupportLevel)
        : undefined;
    },
    [supportLevelData],
  );

  const isFeatureSupportedCallback = React.useCallback(
    (featureId: FeatureId) => {
      const supportLevel = getFeatureSupportLevel(featureId);
      return isFeatureSupported(supportLevel);
    },
    [getFeatureSupportLevel],
  );

  const getDisabledReasonCallback = React.useCallback(
    (featureId: FeatureId) => {
      const isSupported = isFeatureSupportedCallback(featureId);
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
    (featureId: FeatureId) => !!getDisabledReasonCallback(featureId),
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

  React.useEffect(() => {
    if (error) {
      handleApiError(error);
    }
  }, [error]);

  return (
    <NewFeatureSupportLevelContextProvider value={providerValue}>
      {isLoading ? loadingUi : children}
    </NewFeatureSupportLevelContextProvider>
  );
};

export default NewFeatureSupportLevelProvider;
