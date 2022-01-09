/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { FeatureId, FeatureIdToSupportLevel, SupportLevel } from '../../types';

export type FeatureSupportLevelData = {
  getVersionSupportLevelsMap(version: string): FeatureIdToSupportLevel | undefined;
  getFeatureSupportLevel(version: string, featureId: FeatureId): SupportLevel | undefined;
  isFeatureDisabled(version: string, featureId: FeatureId): boolean;
  getFeatureDisabledReason(version: string, featureId: FeatureId): string | undefined;
  isFeatureSupported(version: string, featureId: FeatureId): boolean;
};

export const FeatureSupportLevelContext = React.createContext<FeatureSupportLevelData>({
  getVersionSupportLevelsMap: (_version: string): FeatureIdToSupportLevel | undefined => {
    return undefined;
  },
  getFeatureSupportLevel: (_version: string, _featureId: FeatureId): SupportLevel | undefined =>
    undefined,
  isFeatureSupported: (version: string, featureId: FeatureId): boolean => true,
  isFeatureDisabled: (version: string, featureId: FeatureId): boolean => true,
  getFeatureDisabledReason: (version: string, featureId: FeatureId): string | undefined =>
    undefined,
});

export default FeatureSupportLevelContext;
