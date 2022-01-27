import React, { PropsWithChildren } from 'react';

import { getOCPVersions } from '../helpers';
import {
  FeatureSupportLevelsMap,
  FeatureIdToSupportLevel,
  FeatureId,
  SupportLevel,
  FeatureSupportLevelContextProvider,
  FeatureSupportLevelData,
} from '../../../common';
import { ClusterImageSetK8sResource } from '../../types';

export type ACMFeatureSupportLevelProvider = PropsWithChildren<{
  clusterImages: ClusterImageSetK8sResource[];
  isEditClusterFlow?: boolean;
}>;

export const ACMFeatureSupportLevelProvider: React.FC<ACMFeatureSupportLevelProvider> = ({
  children,
  clusterImages,
  isEditClusterFlow,
}) => {
  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);

  const supportLevelData: FeatureSupportLevelsMap = React.useMemo<FeatureSupportLevelsMap>(() => {
    const featureSupportLevelsMap: FeatureSupportLevelsMap = {};

    ocpVersions.forEach((version) => {
      // TODO(mlibra): get this dynamically
      const featureIdToSupportLevel: FeatureIdToSupportLevel = {
        REQUESTED_HOSTNAME: 'supported',
        SNO: 'tech-preview',
        CNV: 'supported',
        NETWORK_TYPE_SELECTION: 'tech-preview',
      };
      featureSupportLevelsMap[version.version] = featureIdToSupportLevel;
    });
    return featureSupportLevelsMap;
  }, [ocpVersions]);

  const getVersionSupportLevelsMap: FeatureSupportLevelData['getVersionSupportLevelsMap'] = React.useCallback(
    (versionName: string): FeatureIdToSupportLevel | undefined => {
      const version = ocpVersions.find((v) => v.value == versionName);
      const normalized = version?.version;
      return normalized
        ? supportLevelData[normalized]
        : {
            /* empty FeatureIdToSupportLevel */
          };
    },
    [supportLevelData, ocpVersions],
  );

  // TODO(mlibra): Following callbacks can be reused with the OCM flow, just based on providing an application-specific map
  const getFeatureSupportLevel: FeatureSupportLevelData['getFeatureSupportLevel'] = React.useCallback(
    (versionName: string, featureId: FeatureId): SupportLevel | undefined => {
      const versionSupportLevelData = getVersionSupportLevelsMap(versionName);
      return versionSupportLevelData ? versionSupportLevelData[featureId] : undefined;
    },
    [getVersionSupportLevelsMap],
  );

  const isFeatureSupportedCallback: FeatureSupportLevelData['isFeatureSupported'] = React.useCallback(
    () => true,
    [],
  );

  const getDisabledReasonCallback: FeatureSupportLevelData['getFeatureDisabledReason'] = React.useCallback(() => {
    return undefined; // we have recently everything enabled in the ACM
  }, []);

  const isFeatureDisabled: FeatureSupportLevelData['isFeatureDisabled'] = React.useCallback(
    (_version: string, featureId: FeatureId) => {
      if (isEditClusterFlow) {
        if (featureId === 'SNO') {
          return true;
        }
      }
      return false;
    },
    [isEditClusterFlow],
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
