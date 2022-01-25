import { Cluster } from '../../api/types';
import { stringToJSON } from '../../api/utils';
import { ClusterFeatureUsage, FeatureId, FeatureIdToSupportLevel } from '../../types';
import { FeatureSupportLevelData } from './FeatureSupportLevelContext';

export const getLimitedFeatureSupportLevels = (
  cluster: Cluster,
  featureSupportLevelData: FeatureSupportLevelData,
): FeatureIdToSupportLevel | undefined => {
  try {
    if (!cluster.openshiftVersion) {
      throw `cluster doesn't contain the openshift_version field`;
    }
    if (!cluster.featureUsage) {
      throw `cluster doesn't contain the feature_usage field`;
    }
    const ret: FeatureIdToSupportLevel = {};
    const featureUsage = stringToJSON<ClusterFeatureUsage>(cluster.featureUsage);
    if (featureUsage === undefined) {
      throw 'Error parsing cluster feature_usage field';
    }
    const usedFeatureIds: FeatureId[] = Object.values(featureUsage).map(
      (item) => item.id,
    ) as FeatureId[];
    const versionSupportLevelsMap = featureSupportLevelData.getVersionSupportLevelsMap(
      cluster.openshiftVersion,
    );
    if (!versionSupportLevelsMap) {
      throw `No support level data for version ${cluster.openshiftVersion}`;
    }
    for (const featureId of usedFeatureIds) {
      if (featureId in versionSupportLevelsMap) {
        const supportLevel = versionSupportLevelsMap[featureId];
        if (supportLevel === 'supported') {
          continue;
        }
        if (supportLevel === 'unsupported' && featureId !== 'CLUSTER_MANAGED_NETWORKING_WITH_VMS') {
          //since the UI doesn't address unsupported features that aren't CLUSTER_MANAGED_NETWORKING_WITH_VMS they should be ignored
          continue;
        }
        ret[featureId] = versionSupportLevelsMap[featureId];
      }
    }
    return ret;
  } catch (err) {
    console.error(`Failed to get cluster ${cluster.id} feature support levels`);
    return undefined;
  }
};
