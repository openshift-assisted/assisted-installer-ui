// TODO: move to common since networkConfiguration is dependant on it.

import { Cluster, stringToJSON } from '../../api';
import { ErrorHandler } from '../../types/errorHandling';
import { ClusterFeatureUsage, FeatureId, FeatureIdToSupportLevel } from '../../types';
import { FeatureSupportLevelData } from './FeatureSupportLevelContext';

// will be able to implement it once there's a common error handler
export const getLimitedFeatureSupportLevels = (
  cluster: Cluster,
  featureSupportLevelData: FeatureSupportLevelData,
  errorHandler?: ErrorHandler,
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
    if (errorHandler) {
      errorHandler(err, `Failed to get cluster ${cluster.id} feature support levels`);
    }
    return undefined;
  }
};
