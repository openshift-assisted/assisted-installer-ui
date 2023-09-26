import { createSelector } from '@reduxjs/toolkit';
import { AssistedInstallerFeatureType } from '../../../../common';
import { RootStateDay1 } from '../../store-day1';

export const selectFeatureFlagsSlice = (state: RootStateDay1) => state.featureFlags;

export const isFeatureEnabled = createSelector(
  [selectFeatureFlagsSlice, (_, feature: AssistedInstallerFeatureType) => feature],
  (featureFlags, feature) => {
    return !!featureFlags.data[feature];
  },
);
