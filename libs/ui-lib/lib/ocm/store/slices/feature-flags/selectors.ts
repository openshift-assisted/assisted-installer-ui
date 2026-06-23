import type { FeatureListType } from '../../../../common/features/featureGate';
import type { RootStateDay1 } from '../../store-day1';
import { createSelector } from '@reduxjs/toolkit';
import type { Selector } from 'reselect';

export const selectFeatureFlagsSlice = (state: RootStateDay1) => state.featureFlags;

export const isFeatureEnabled = (
  featureId: keyof FeatureListType,
): Selector<RootStateDay1, boolean> =>
  createSelector(
    selectFeatureFlagsSlice,
    (featureFlags: ReturnType<typeof selectFeatureFlagsSlice>): boolean =>
      featureFlags.data[featureId] ?? false,
  );
