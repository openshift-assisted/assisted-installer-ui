import { ClusterFeatureUsage, FeatureId, FeatureIdToSupportLevel } from '../../../common/types';
import { Cluster } from '../../../common/api/types';
import { FeatureSupportLevelData } from '../../../common/components/featureSupportLevels/FeatureSupportLevelContext';
import { captureException } from '../../sentry';
import * as Sentry from '@sentry/browser';
import { stringToJSON } from '../../../common/api/utils';

// TODO: move to common since networkConfiguration is dependant on it.
// will be able to implement it once there's a common error handler
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
    captureException(
      err,
      `Failed to get cluster ${cluster.id} feature support levels`,
      Sentry.Severity.Warning,
    );
    return undefined;
  }
};
