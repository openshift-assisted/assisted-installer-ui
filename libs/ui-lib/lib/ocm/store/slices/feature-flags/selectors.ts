import type { FeatureListType } from '../../../../common/features/featureGate';
import type { RootStateDay1 } from '../../store-day1';
import { createSelector } from '@reduxjs/toolkit';

export const selectFeatureFlagsSlice = (state: RootStateDay1) => state.featureFlags;

export const isFeatureEnabled = createSelector(
  selectFeatureFlagsSlice,
  (_featureFlags: ReturnType<typeof selectFeatureFlagsSlice>, featureId: keyof FeatureListType) =>
    featureId,
  (featureFlags, featureId) => featureFlags.data[featureId],
);
