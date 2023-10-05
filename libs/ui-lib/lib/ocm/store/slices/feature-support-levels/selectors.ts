import { createSelector } from '@reduxjs/toolkit';
import { RootStateDay1 } from '../../store-day1';
import {
  FeatureSupportLevelId,
  InfraEnv,
} from '@openshift-assisted/types/./assisted-installer-service';
import { getNewFeatureDisabledReason } from '../../../components/featureSupportLevels/featureStateUtils';
import {
  CpuArchitecture,
  SupportedCpuArchitecture,
  getDefaultCpuArchitecture,
} from '../../../../common';
import { selectCurrentCluster } from '../current-cluster/selectors';

export const selectFeatureSupportLevelsSlice = (state: RootStateDay1) => state.featureSupportLevels;

export const isFeatureSupportedAndAvailable = createSelector(
  [selectFeatureSupportLevelsSlice, (_, feature: FeatureSupportLevelId) => feature],
  (featureSupportLevels, feature) => {
    return (
      featureSupportLevels[feature] !== 'unsupported' &&
      featureSupportLevels[feature] !== 'unavailable'
    );
  },
);

export const getFeatureDisabledReason = createSelector(
  [
    selectFeatureSupportLevelsSlice,
    (_, feature: FeatureSupportLevelId) => feature,
    selectCurrentCluster,
    (_, infraEnv: InfraEnv) => infraEnv,
  ],
  (featureSupportLevels, feature, cluster, infraEnv) => {
    const isSupported = isFeatureSupportedAndAvailable(featureSupportLevels, feature);
    // Define activeFeatureConfiguration here based on cluster and infraEnv
    const activeFeatureConfiguration = {
      underlyingCpuArchitecture: (infraEnv?.cpuArchitecture ||
        cluster?.cpuArchitecture ||
        getDefaultCpuArchitecture()) as CpuArchitecture,
      hasStaticIpNetworking: !!infraEnv?.staticNetworkConfig,
    };
    return getNewFeatureDisabledReason(
      feature,
      cluster,
      activeFeatureConfiguration,
      isSupported,
      cluster?.cpuArchitecture as SupportedCpuArchitecture,
      cluster?.platform?.type,
    );
  },
);

export const isFeatureDisabled = createSelector([getFeatureDisabledReason], (disabledReason) => {
  // Return true if there is a disabled reason, indicating the feature is disabled
  return !!disabledReason;
});
