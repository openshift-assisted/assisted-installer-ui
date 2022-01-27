import useSWR from 'swr';
import React, { PropsWithChildren } from 'react';
import * as Sentry from '@sentry/browser';
import {
  FeatureSupportLevelsMap,
  FeatureIdToSupportLevel,
  FeatureId,
  SupportLevel,
  FeatureSupportLevels,
  Cluster,
} from '../../../common';
import {
  FeatureSupportLevelContextProvider,
  FeatureSupportLevelData,
} from '../../../common/components/featureSupportLevels';
import { handleApiError } from '../../api';
import { FeatureSupportLevelsAPI } from '../../services/apis';
import { captureException } from '../../sentry';
import { useOpenshiftVersions } from '../../hooks';
import { getFeatureDisabledReason, isFeatureSupported } from './featureStateUtils';

export type SupportLevelProviderProps = PropsWithChildren<{
  clusterFeatureUsage?: string;
  openshiftVersion?: string;
  loadingUi: React.ReactNode;
  cluster?: Cluster;
}>;

const getFeatureSupportLevelsMap = (
  featureSupportLevels: FeatureSupportLevels,
): FeatureSupportLevelsMap => {
  try {
    const featureSupportLevelsMap: FeatureSupportLevelsMap = {};
    for (const { openshiftVersion, features } of featureSupportLevels) {
      if (!openshiftVersion || !features) {
        continue;
      }
      featureSupportLevelsMap[openshiftVersion] = {};
      for (const { featureId, supportLevel } of features) {
        if (!featureId || !supportLevel) {
          continue;
        }
        featureSupportLevelsMap[openshiftVersion][featureId] = supportLevel;
      }
    }
    return featureSupportLevelsMap;
  } catch (err) {
    captureException(err, 'Failed to parse feature support levels', Sentry.Severity.Warning);
    return {};
  }
};
export const FeatureSupportLevelProvider: React.FC<SupportLevelProviderProps> = ({
  cluster,
  children,
  loadingUi,
}) => {
  const {
    loading: loadingOCPVersions,
    versions: versionOptions,
    normalizeClusterVersion,
  } = useOpenshiftVersions();
  const fetcher = () => FeatureSupportLevelsAPI.list().then((res) => res.data);
  const { data: featureSupportLevels, error } = useSWR<FeatureSupportLevels>(
    FeatureSupportLevelsAPI.makeBaseURI(),
    fetcher,
    { errorRetryCount: 0, revalidateOnFocus: false },
  );
  const isLoading = (!featureSupportLevels && !error) || loadingOCPVersions;

  const supportLevelData: FeatureSupportLevelsMap = React.useMemo<FeatureSupportLevelsMap>(() => {
    if (!featureSupportLevels || error) {
      return {};
    }
    return getFeatureSupportLevelsMap(featureSupportLevels);
  }, [error, featureSupportLevels]);

  const getVersionSupportLevelsMap = React.useCallback(
    (versionName: string): FeatureIdToSupportLevel | undefined => {
      const normalized = normalizeClusterVersion(versionName);
      if (!normalized) {
        return undefined;
      }
      return supportLevelData[normalized];
    },
    [supportLevelData, normalizeClusterVersion],
  );

  const getFeatureSupportLevel = React.useCallback(
    (versionName: string, featureId: FeatureId): SupportLevel | undefined => {
      const versionSupportLevelData = getVersionSupportLevelsMap(versionName);
      return versionSupportLevelData ? versionSupportLevelData[featureId] : undefined;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [getVersionSupportLevelsMap],
  );

  const isFeatureSupportedCallback = React.useCallback(
    (versionName: string, featureId: FeatureId) => {
      const normalizedVersion = normalizeClusterVersion(versionName);
      const supportLevel = getFeatureSupportLevel(versionName, featureId);
      return isFeatureSupported(normalizedVersion, featureId, supportLevel, versionOptions);
    },
    [getFeatureSupportLevel, normalizeClusterVersion, versionOptions],
  );

  //TODO(brotman): move to separate context FeatureStateContext
  const getDisabledReasonCallback = React.useCallback(
    (versionName: string, featureId: FeatureId) => {
      const normalizedVersion = normalizeClusterVersion(versionName);
      const isSupported = isFeatureSupportedCallback(versionName, featureId);
      return getFeatureDisabledReason(
        featureId,
        cluster,
        normalizedVersion,
        versionOptions,
        isSupported,
      );
    },
    [isFeatureSupportedCallback, normalizeClusterVersion, versionOptions, cluster],
  );

  const isFeatureDisabled = React.useCallback(
    (version, featureId: FeatureId) => !!getDisabledReasonCallback(version, featureId),
    [getDisabledReasonCallback],
  );

  const providerValue = React.useMemo<FeatureSupportLevelData>(() => {
    return {
      getVersionSupportLevelsMap: getVersionSupportLevelsMap,
      getFeatureSupportLevel: getFeatureSupportLevel,
      isFeatureDisabled: isFeatureDisabled,
      getFeatureDisabledReason: getDisabledReasonCallback,
      isFeatureSupported: isFeatureSupportedCallback,
    };
  }, [
    getVersionSupportLevelsMap,
    getFeatureSupportLevel,
    isFeatureDisabled,
    getDisabledReasonCallback,
    isFeatureSupportedCallback,
  ]);

  React.useEffect(() => {
    if (error) {
      handleApiError(error);
    }
  }, [error]);

  return (
    <FeatureSupportLevelContextProvider value={providerValue}>
      {isLoading ? loadingUi : children}
    </FeatureSupportLevelContextProvider>
  );
};

export default FeatureSupportLevelProvider;
