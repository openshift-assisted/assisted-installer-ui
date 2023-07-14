import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelContext';
import { clusterExistsReason as CLUSTER_EXISTS_REASON } from '../components/featureSupportLevels/featureStateUtils';
export const FEATURE_ID = 'EXTERNAL_PLATFORM_OCI';

export interface OracleDropdownItemState {
  readonly featureId: string;
  readonly isSupported: boolean;
  readonly isDisabled: boolean;
  readonly disabledReason?: string;
}

export const useOracleDropdownItemState = (
  hasExistentCluster: boolean,
  featureSupportLevelData: NewFeatureSupportLevelMap | null,
): OracleDropdownItemState | null => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  if (!featureSupportLevelData) {
    return null;
  }

  const isSupported = featureSupportLevelData
    ? featureSupportLevelContext.isFeatureSupported(FEATURE_ID, featureSupportLevelData)
    : false;

  let disabledReason: string | undefined;
  if (hasExistentCluster) {
    disabledReason = CLUSTER_EXISTS_REASON;
  } else {
    disabledReason = featureSupportLevelContext.getFeatureDisabledReason(FEATURE_ID);
  }

  return {
    featureId: FEATURE_ID,
    isSupported,
    isDisabled: disabledReason !== undefined,
    disabledReason,
  };
};
