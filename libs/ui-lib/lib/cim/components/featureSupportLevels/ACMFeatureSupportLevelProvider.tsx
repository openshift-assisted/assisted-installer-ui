import React, { PropsWithChildren } from 'react';
import {
  FeatureSupportLevelsMap,
  FeatureIdToSupportLevel,
  FeatureId,
  SupportLevel,
  FeatureSupportLevelContextProvider,
  FeatureSupportLevelData,
} from '../../../common';
import { ClusterImageSetK8sResource } from '../../types';
import { featureSupportLevelsACM } from '../../config/constants';
import { getFeatureDisabledReason, isFeatureSupported } from './featureStateUtils';
import { getOCPVersions, getVersionFromReleaseImage, getMajorMinorVersion } from '../helpers';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export type ACMFeatureSupportLevelProvider = PropsWithChildren<{
  clusterImages: ClusterImageSetK8sResource[];
  isEditClusterFlow?: boolean;
}>;
const getFeatureSupportLevelsMap = (): FeatureSupportLevelsMap => {
  try {
    const featureSupportLevelsMap: FeatureSupportLevelsMap = {};
    featureSupportLevelsACM.supportLevels.forEach((feature) => {
      const featureIdParams: FeatureIdToSupportLevel = {};
      const featureProps = feature.features;
      featureProps.forEach((ops) => {
        featureIdParams[ops.featureId] = ops.supportLevel;
      });
      featureSupportLevelsMap[feature.openshiftVersion] = featureIdParams;
    });
    return featureSupportLevelsMap;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const ACMFeatureSupportLevelProvider: React.FC<ACMFeatureSupportLevelProvider> = ({
  children,
  clusterImages,
  isEditClusterFlow = false,
}) => {
  const { t } = useTranslation();

  const supportLevelData: FeatureSupportLevelsMap = React.useMemo<FeatureSupportLevelsMap>(() => {
    return getFeatureSupportLevelsMap();
  }, []);
  const ocpVersions = getOCPVersions(clusterImages);

  const getNormalizedVersion = React.useCallback(
    (versionName: string) => {
      const clusterImage = clusterImages.find(
        (clusterImageSet) => clusterImageSet.metadata?.name === versionName,
      );
      const version =
        getVersionFromReleaseImage(clusterImage?.spec?.releaseImage) ||
        clusterImage?.metadata?.name ||
        '';
      return getMajorMinorVersion(version);
    },
    [clusterImages],
  );

  const getVersionSupportLevelsMap: FeatureSupportLevelData['getVersionSupportLevelsMap'] =
    React.useCallback(
      (versionName: string): FeatureIdToSupportLevel | undefined => {
        const normalized = getNormalizedVersion(versionName);
        return normalized
          ? supportLevelData[normalized]
          : {
              /* empty FeatureIdToSupportLevel */
            };
      },
      [supportLevelData, getNormalizedVersion],
    );

  // TODO(mlibra): Following callbacks can be reused with the OCM flow, just based on providing an application-specific map
  const getFeatureSupportLevel: FeatureSupportLevelData['getFeatureSupportLevel'] =
    React.useCallback(
      (versionName: string, featureId: FeatureId): SupportLevel | undefined => {
        const versionSupportLevelData = getVersionSupportLevelsMap(versionName);
        return versionSupportLevelData ? versionSupportLevelData[featureId] : undefined;
      },
      [getVersionSupportLevelsMap],
    );

  const isFeatureSupportedCallback = React.useCallback(
    (versionName: string, featureId: FeatureId) => {
      const supportLevel = getFeatureSupportLevel(versionName, featureId);
      return isFeatureSupported(supportLevel);
    },
    [getFeatureSupportLevel],
  );

  const getDisabledReasonCallback = React.useCallback(
    (versionName: string, featureId: FeatureId) => {
      const isSupported = isFeatureSupportedCallback(versionName, featureId);
      return getFeatureDisabledReason(
        featureId,
        isEditClusterFlow,
        versionName,
        ocpVersions,
        isSupported,
        t,
      );
    },
    [isFeatureSupportedCallback, t, ocpVersions, isEditClusterFlow],
  );

  const isFeatureDisabled = React.useCallback(
    (version: string, featureId: FeatureId) => !!getDisabledReasonCallback(version, featureId),
    [getDisabledReasonCallback],
  );

  const providerValue = React.useMemo<FeatureSupportLevelData>(() => {
    return {
      getVersionSupportLevelsMap,
      getFeatureSupportLevel,
      isFeatureDisabled,
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

  return (
    <FeatureSupportLevelContextProvider value={providerValue}>
      {children}
    </FeatureSupportLevelContextProvider>
  );
};

export default ACMFeatureSupportLevelProvider;
