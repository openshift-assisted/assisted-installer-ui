import { TFunction } from 'i18next';
import { Cluster, stringToJSON } from '../../api';
import { ClusterFeatureUsage, FeatureId, FeatureIdToSupportLevel } from '../../types';
import { FeatureSupportLevelData } from './FeatureSupportLevelContext';

export const getLimitedFeatureSupportLevels = (
  cluster: Cluster,
  featureSupportLevelData: FeatureSupportLevelData,
  t: TFunction,
): FeatureIdToSupportLevel => {
  if (!cluster.openshiftVersion) {
    throw t("ai:cluster doesn't contain the openshift_version field");
  }
  if (!cluster.featureUsage) {
    throw t("ai:cluster doesn't contain the feature_usage field");
  }
  const featureUsage = stringToJSON<ClusterFeatureUsage>(cluster.featureUsage);
  if (featureUsage === undefined) {
    throw t('ai:Error parsing cluster feature_usage field');
  }
  const usedFeatureIds: FeatureId[] = Object.values(featureUsage).map((item) => item.id);
  const versionSupportLevelsMap = featureSupportLevelData.getVersionSupportLevelsMap(
    cluster.openshiftVersion,
  );
  if (!versionSupportLevelsMap) {
    throw t('ai:No support level data for version {{openshiftVersion}}', {
      openshiftVersion: cluster.openshiftVersion,
    });
  }

  const ret: FeatureIdToSupportLevel = {};
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
};
