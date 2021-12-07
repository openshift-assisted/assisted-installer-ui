/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { FeatureId, FeatureIdToSupportLevel, SupportLevel } from '../../types';

export type FeatureSupportLevelData = {
  getVersionSupportLevelsMap(version: string): FeatureIdToSupportLevel | undefined;
  getFeatureSupportLevel(version: string, featureId: FeatureId): SupportLevel | undefined;
};

export const FeatureSupportLevelContext = React.createContext<FeatureSupportLevelData>({
  getVersionSupportLevelsMap: (_version: string): FeatureIdToSupportLevel | undefined => {
    return undefined;
  },
  getFeatureSupportLevel: (_version: string, _featureId: FeatureId): SupportLevel | undefined =>
    undefined,
});

export default FeatureSupportLevelContext;
