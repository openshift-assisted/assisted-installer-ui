import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureListType } from '../../../../common';

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState: {} as FeatureListType,
  reducers: {
    setFeatureFlags: (state, action: PayloadAction<FeatureListType>) => {
      return Object.assign(state, action.payload);
    },
  },
});

export const featureFlagsActions = featureFlagsSlice.actions;
export const featureFlagsReducer = featureFlagsSlice.reducer;
