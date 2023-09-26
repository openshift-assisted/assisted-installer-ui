import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureListType, STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../../common';
import { detectFeatures } from './thunks';
import { StateSliceWithMeta } from '../types/state-slice';
import { FeatureStatus } from './feature-status';

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState: (): StateSliceWithMeta<FeatureListType, Error | null> => {
    return {
      data: STANDALONE_DEPLOYMENT_ENABLED_FEATURES,
      error: null,
      meta: {
        status: 'idle',
        currentRequestId: null,
        updatedAt: null,
      },
    };
  },
  reducers: {
    setFeatureFlag: (state, action: PayloadAction<FeatureStatus>) => {
      state.data[action.payload.name] = action.payload.isEnabled;
      state.error = null;
      state.meta.updatedAt = new Date().toUTCString();
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(detectFeatures.pending, (draftState, action) => {
      if (/idle|fulfilled|rejected/.test(draftState.meta.status)) {
        draftState.meta.status = action.meta.requestStatus;
        draftState.meta.currentRequestId = action.meta.requestId;
        draftState.meta.updatedAt = new Date().toUTCString();
      }
      return draftState;
    });
    builder.addCase(detectFeatures.fulfilled, (draftState, action) => {
      if (/pending/.test(draftState.meta.status)) {
        draftState.meta.status = action.meta.requestStatus;
        draftState.meta.currentRequestId = action.meta.requestId;
        draftState.meta.updatedAt = new Date().toUTCString();
      }
      return draftState;
    });
    builder.addCase(detectFeatures.rejected, (draftState, action) => {
      if (/pending/.test(draftState.meta.status)) {
        draftState.meta.status = action.meta.requestStatus;
        draftState.meta.currentRequestId = action.meta.requestId;
        draftState.meta.updatedAt = new Date().toUTCString();
      }
      return draftState;
    });
  },
});

export const featureFlagsActions = featureFlagsSlice.actions;
export const featureFlagsReducer = featureFlagsSlice.reducer;
