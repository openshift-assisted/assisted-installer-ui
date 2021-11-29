import useSWR from 'swr';
import React, { PropsWithChildren } from 'react';
import {
  FeatureSupportLevelsMap,
  FeatureIdToSupportLevel,
  FeatureId,
  SupportLevel,
  FeatureSupportLevels,
} from '../../../common';
import { FeatureSupportLevelContext } from '../../../common/components/featureSupportLevels';
import { FeatureSupportLevelData } from '../../../common/components/featureSupportLevels/FeatureSupportLevelContext';
import { handleApiError } from '../../api';
import { FeatureSupportLevelsAPI } from '../../services/api';

export type SupportLevelProviderProps = PropsWithChildren<{
  clusterFeatureUsage?: string;
  openshiftVersion?: string;
  loadingUi: React.ReactNode;
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
    console.error(`Failed to parse feature support levels ${err}`);
    return {};
  }
};

//TODO(brotman): share code with normalizeVersion function in src/ocm/components/fetching/openshiftVersions.tsx
const normalizeVersion = (
  supportLevelData: FeatureSupportLevelsMap,
  version: string,
): string | undefined => {
  const versions = Object.keys(supportLevelData);
  return versions.find((normalized) => version.startsWith(normalized));
};

export const FeatureSupportLevelProvider: React.FC<SupportLevelProviderProps> = ({
  children,
  loadingUi,
}) => {
  const fetcher = () => FeatureSupportLevelsAPI.list().then((res) => res.data);
  const { data: featureSupportLevels, error } = useSWR<FeatureSupportLevels>(
    FeatureSupportLevelsAPI.makeBaseURI(),
    fetcher,
    { errorRetryCount: 0, revalidateOnFocus: false },
  );
  const isLoading = !featureSupportLevels && !error;

  const supportLevelData: FeatureSupportLevelsMap = React.useMemo<FeatureSupportLevelsMap>(() => {
    if (!featureSupportLevels || error) {
      return {};
    }
    return getFeatureSupportLevelsMap(featureSupportLevels);
  }, [error, featureSupportLevels]);

  const getVersionSupportLevelsMap = React.useCallback(
    (version: string): FeatureIdToSupportLevel | undefined => {
      const normalized = normalizeVersion(supportLevelData, version);
      if (!normalized) {
        return undefined;
      }
      return supportLevelData[normalized];
    },
    [supportLevelData],
  );

  const getFeatureSupportLevel = React.useCallback(
    (version: string, featureId: FeatureId): SupportLevel | undefined => {
      const versionSupportLevelData = getVersionSupportLevelsMap(version);
      return versionSupportLevelData ? versionSupportLevelData[featureId] : undefined;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [getVersionSupportLevelsMap],
  );

  const providerValue = React.useMemo<FeatureSupportLevelData>(() => {
    return {
      getVersionSupportLevelsMap: getVersionSupportLevelsMap,
      getFeatureSupportLevel: getFeatureSupportLevel,
    };
  }, [getVersionSupportLevelsMap, getFeatureSupportLevel]);

  React.useEffect(() => {
    if (error) {
      handleApiError(error);
    }
  }, [error]);

  return (
    <FeatureSupportLevelContext.Provider value={providerValue}>
      {isLoading ? loadingUi : children}
    </FeatureSupportLevelContext.Provider>
  );
};

export default FeatureSupportLevelProvider;
