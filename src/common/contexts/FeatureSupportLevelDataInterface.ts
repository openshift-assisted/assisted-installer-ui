import { FeatureId, SupportLevel, SupportLevelMap } from '../types';

interface FeatureSupportLevelDataInterface {
  getVersionSupportLevel(featureId: FeatureId): SupportLevel | undefined;
  getClusterSupportLevel(featureId: FeatureId): SupportLevel | undefined;
  clusterSupportLevelMap: SupportLevelMap | undefined;
  openshiftVersion: string | undefined;
  isFullySupported: boolean | undefined;
}

// eslint-disable-next-line no-undef
export default FeatureSupportLevelDataInterface;
