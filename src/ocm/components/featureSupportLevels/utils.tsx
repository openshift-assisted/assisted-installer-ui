import { ClusterFeatureUsage, FeatureIdToSupportLevel } from '../../../common/types';
import { Cluster } from '../../../common/api/types';
import { FeatureSupportLevelData } from '../../../common/components/featureSupportLevels/FeatureSupportLevelContext';

export const getClusterUsedFeaturesSupportLevels = (
  cluster: Cluster,
  featureSuppoLevelService: FeatureSupportLevelData,
): FeatureIdToSupportLevel | undefined => {
  if (!cluster.openshiftVersion || !cluster.featureUsage) {
    return undefined;
  }
  try {
    const ret: FeatureIdToSupportLevel = {};
    const featureUsage: ClusterFeatureUsage = JSON.parse(cluster.featureUsage);
    const usedFeatureIds: string[] = Object.values(featureUsage).map((item) => item.id);
    const versionSupportLevelsMap:
      | FeatureIdToSupportLevel
      | undefined = featureSuppoLevelService.getVersionSupportLevelsMap(cluster.openshiftVersion);
    if (!versionSupportLevelsMap) {
      return undefined;
    }
    for (const featureId of usedFeatureIds) {
      if (featureId in versionSupportLevelsMap) {
        ret[featureId] = versionSupportLevelsMap[featureId];
      }
    }
    return ret;
  } catch (err) {
    console.error(`Failed to get cluster used feature support levels ${err}`);
    return undefined;
  }
};

export const isFullySupported = (clusterFeatureSupportLevels: FeatureIdToSupportLevel): boolean => {
  return Object.keys(clusterFeatureSupportLevels).length === 0;
};
