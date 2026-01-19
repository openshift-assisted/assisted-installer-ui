import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import type { StateSliceWithMeta } from '../../types/state-slice';
import type { FeatureListType } from '@openshift-assisted/common/features/featureGate';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '@openshift-assisted/common/features/featureGate';
import { currentUserAsyncActions } from '../current-user/slice';

const featureFlagsAsyncActions = {
  detectFeaturesAsync: createAsyncThunk(
    'featureFlags/detectFeatures',
    async (featuresOverride: FeatureListType | null = null, thunkApi) => {
      await thunkApi.dispatch(currentUserAsyncActions.getCapabilitiesAsync());
      if (featuresOverride !== null) {
        for (const [k, v] of Object.entries(featuresOverride)) {
          thunkApi.dispatch(
            featureFlagsActions.setFeatureFlag({
              featureId: k as keyof FeatureListType,
              isEnabled: v,
            }),
          );
        }
      }
    },
  ),
};

type AsyncThunkActions = (typeof featureFlagsAsyncActions)[keyof typeof featureFlagsAsyncActions];
type FeatureFlagsAsyncThunkActionCreators =
  | ReturnType<AsyncThunkActions['pending']>
  | ReturnType<AsyncThunkActions['fulfilled']>
  | ReturnType<AsyncThunkActions['rejected']>;

export type FeatureFlagsState = StateSliceWithMeta<FeatureListType, SerializedError | null>;

const initialState: FeatureFlagsState = {
  data: STANDALONE_DEPLOYMENT_ENABLED_FEATURES,
  error: null,
  meta: {
    status: 'idle',
    updatedAt: null,
    currentRequestId: null,
  },
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    setMeta: (state, action: PayloadAction<FeatureFlagsAsyncThunkActionCreators>) => {
      state.meta.updatedAt = new Date().toUTCString();
      state.meta.status = action.payload.meta.requestStatus;
      state.meta.currentRequestId = action.payload.meta.requestId;
      return state;
    },
    setFeatureFlag: (
      state,
      action: PayloadAction<{ featureId: keyof FeatureListType; isEnabled: boolean }>,
    ) => {
      const { featureId, isEnabled } = action.payload;
      state.data[featureId] = isEnabled;
      state.error = null;
      state.meta.updatedAt = new Date().toUTCString();
      return state;
    },
  },
  extraReducers: (builder) => {
    for (const { pending, fulfilled, rejected } of Object.values(featureFlagsAsyncActions)) {
      builder.addCase(pending, (state, action) => {
        if (/idle|fulfilled|rejected/.test(state.meta.status)) {
          featureFlagsActions.setMeta(action);
        }
        return state;
      });
      builder.addCase(fulfilled, (state, action) => {
        if (/idle|pending/.test(state.meta.status)) {
          featureFlagsActions.setMeta(action);
        }
        return state;
      });
      builder.addCase(rejected, (state, action) => {
        if (/idle|pending/.test(state.meta.status)) {
          featureFlagsActions.setMeta(action);
          state.error = action.error;
        }
        return state;
      });
    }
  },
});

const featureFlagsActions = featureFlagsSlice.actions;
const featureFlagsReducer = featureFlagsSlice.reducer;

export { featureFlagsAsyncActions, featureFlagsActions, featureFlagsReducer };
