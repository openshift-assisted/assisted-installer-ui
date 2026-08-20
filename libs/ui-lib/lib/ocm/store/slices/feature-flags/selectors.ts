import { createSelector } from '@reduxjs/toolkit';
import type { Selector } from 'reselect';
import type { RootStateDay1 } from '../../store-day1';
import { FeatureListType } from '../../../hooks/types';

export const selectFeatureFlagsSlice = (state: RootStateDay1) => state.featureFlags;

export const isFeatureEnabled = (
  featureId: keyof FeatureListType,
): Selector<RootStateDay1, boolean> =>
  createSelector(
    selectFeatureFlagsSlice,
    (featureFlags: ReturnType<typeof selectFeatureFlagsSlice>): boolean =>
      featureFlags.data[featureId] ?? false,
  );
