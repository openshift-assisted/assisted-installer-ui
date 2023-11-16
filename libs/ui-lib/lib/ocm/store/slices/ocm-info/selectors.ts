import type { FeatureListType } from '../../../../common/features/featureGate';
import type { RootStateDay1 } from '../../store-day1';
import { createSelector } from '@reduxjs/toolkit';

export const selectOcmInfoSlice = (state: RootStateDay1) => state.ocmInfo;

export const isOcm = createSelector([selectOcmInfoSlice], (ocmInfo): boolean => {
  return ocmInfo.isOcm;
});
