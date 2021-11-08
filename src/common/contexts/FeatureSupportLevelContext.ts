import React from 'react';
import { FeatureId, SupportLevel, SupportLevelMap } from '../types';
import FeatureSupportLevelDataInterface from './FeatureSupportLevelDataInterface';

export class EmptyFeatureSupportLevelData implements FeatureSupportLevelDataInterface {
  public isFullySupported: boolean | undefined;
  public openshiftVersion: string | undefined;
  public clusterSupportLevelMap: SupportLevelMap | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getVersionSupportLevel(featureId: FeatureId): SupportLevel | undefined {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClusterSupportLevel(featureId: FeatureId): SupportLevel | undefined {
    return undefined;
  }
}

export const FeatureSupportLevelContext = React.createContext<FeatureSupportLevelDataInterface>(
  new EmptyFeatureSupportLevelData(),
);

export default FeatureSupportLevelContext;
