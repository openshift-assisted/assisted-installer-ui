/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { FeatureId, SupportLevel, SupportLevelMap } from '../types';
import FeatureSupportLevelDataInterface from './FeatureSupportLevelDataInterface';

export class DefaultFeatureSupportLevelData implements FeatureSupportLevelDataInterface {
  isFullySupported: boolean | undefined;
  clusterUsedFeatureSupportLevels: SupportLevelMap = {};
  featureSupportLevels: SupportLevelMap = {};
  getFeatureSupportLevel(
    featureId: FeatureId,
    openshiftVersion?: string,
  ): SupportLevel | undefined {
    return undefined;
  }
}

export const FeatureSupportLevelContext = React.createContext<FeatureSupportLevelDataInterface>(
  new DefaultFeatureSupportLevelData(),
);

export default FeatureSupportLevelContext;
