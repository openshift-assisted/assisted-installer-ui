import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import type { StateSliceWithMeta } from '../../types/state-slice';
import type { FeatureStatus } from './types/feature-status';
import type { FeatureListType } from '../../../../common/features/featureGate';
import { createSlice } from '@reduxjs/toolkit';
import { detectFeatures, updateMeta } from './thunks';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../../common/features/featureGate';

export type FeatureFlagsState = StateSliceWithMeta<FeatureListType, SerializedError | null>;

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState: () =>
    ({
      data: STANDALONE_DEPLOYMENT_ENABLED_FEATURES,
      error: null,
      meta: {
        status: 'idle',
        updatedAt: null,
        currentRequestId: null,
      },
    } as FeatureFlagsState),
  reducers: {
    setFeatureFlag: (state, action: PayloadAction<FeatureStatus>) => {
      state.data[action.payload.name] = action.payload.isEnabled;
      state.error = null;
      state.meta.updatedAt = new Date().toUTCString();
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(detectFeatures.pending, (state, action) => {
      if (/idle|fulfilled|rejected/.test(state.meta.status)) {
        updateMeta(state, action);
      }
      return state;
    });
    builder.addCase(detectFeatures.fulfilled, (state, action) => {
      if (/pending/.test(state.meta.status)) {
        updateMeta(state, action);
      }
      return state;
    });
    builder.addCase(detectFeatures.rejected, (state, action) => {
      if (/pending/.test(state.meta.status)) {
        updateMeta(state, action);
        state.error = action.error;
      }
      return state;
    });
  },
});

export const featureFlagsActions = featureFlagsSlice.actions;
export const featureFlagsReducer = featureFlagsSlice.reducer;
