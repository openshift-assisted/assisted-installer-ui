import { FeatureId, SupportLevel, SupportLevelMap } from '../types';

interface FeatureSupportLevelDataInterface {
  getFeatureSupportLevel(featureId: FeatureId, openshiftVersion?: string): SupportLevel | undefined;
  clusterUsedFeatureSupportLevels: SupportLevelMap;
  isFullySupported: boolean | undefined;
}

// eslint-disable-next-line no-undef
export default FeatureSupportLevelDataInterface;
