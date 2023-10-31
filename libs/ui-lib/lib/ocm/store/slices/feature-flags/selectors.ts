import type { FeatureListType } from '../../../../common/features/featureGate';
import type { RootStateDay1 } from '../../store-day1';
import { createSelector } from '@reduxjs/toolkit';

export const selectFeatureFlagsSlice = (state: RootStateDay1) => state.featureFlags;

export const isFeatureEnabled = (featureId: keyof FeatureListType) =>
  createSelector(
    selectFeatureFlagsSlice,
    (featureFlags: ReturnType<typeof selectFeatureFlagsSlice>) =>
      featureFlags.data[featureId] ?? false,
  );
