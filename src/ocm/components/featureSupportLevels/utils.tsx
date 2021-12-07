import { ClusterFeatureUsage, FeatureIdToSupportLevel } from '../../../common/types';
import { Cluster } from '../../../common/api/types';
import { FeatureSupportLevelData } from '../../../common/components/featureSupportLevels/FeatureSupportLevelContext';
import { captureException } from '../../sentry';
import * as Sentry from '@sentry/browser';
import { stringToJSON } from '../../../common/api/utils';

export const getClusterUsedFeaturesSupportLevels = (
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
    const usedFeatureIds: string[] = Object.values(featureUsage).map((item) => item.id);
    const versionSupportLevelsMap = featureSupportLevelData.getVersionSupportLevelsMap(
      cluster.openshiftVersion,
    );
    if (!versionSupportLevelsMap) {
      throw `No support level data for version ${cluster.openshiftVersion}`;
    }
    for (const featureId of usedFeatureIds) {
      if (featureId in versionSupportLevelsMap) {
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

export const isFullySupported = (clusterFeatureSupportLevels: FeatureIdToSupportLevel): boolean => {
  return Object.keys(clusterFeatureSupportLevels).length === 0;
};
