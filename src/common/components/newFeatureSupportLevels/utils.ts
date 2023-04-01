import { Cluster, stringToJSON, SupportLevel } from '../../api';
import { ClusterFeatureUsage, FeatureId, FeatureIdToSupportLevel } from '../../types';
import {
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
} from './NewFeatureSupportLevelContext';
import { TFunction } from 'i18next';

export const getLimitedFeatureSupportLevels = (
  cluster: Cluster,
  featureSupportLevelData: NewFeatureSupportLevelData,
  t: TFunction,
): FeatureIdToSupportLevel => {
  if (!cluster.openshiftVersion) {
    throw t
      ? t("ai:cluster doesn't contain the openshift_version field")
      : "cluster doesn't contain the openshift_version field";
  }
  if (!cluster.featureUsage) {
    throw t
      ? t("ai:cluster doesn't contain the feature_usage field")
      : "ai:cluster doesn't contain the feature_usage field";
  }
  const ret: FeatureIdToSupportLevel = {};
  const featureUsage = stringToJSON<ClusterFeatureUsage>(cluster.featureUsage);
  if (featureUsage === undefined) {
    throw t
      ? t('ai:Error parsing cluster feature_usage field')
      : 'Error parsing cluster feature_usage field';
  }
  const usedFeatureIds: FeatureId[] = Object.values(featureUsage).map((item) => item.id);
  const versionSupportLevels: NewFeatureSupportLevelMap =
    featureSupportLevelData.getFeatureSupportLevels();
  if (!versionSupportLevels) {
    throw t
      ? t('ai:No support level data for version {{openshiftVersion}}', {
          openshiftVersion: cluster.openshiftVersion,
        })
      : `No support level data for version ${cluster.openshiftVersion}`;
  }
  for (const featureId of usedFeatureIds) {
    if (featureId in versionSupportLevels) {
      const supportLevel: SupportLevel = versionSupportLevels[featureId] as SupportLevel;
      if (supportLevel === 'supported') {
        continue;
      }
      ret[featureId] = supportLevel;
    }
  }
  return ret;
};
