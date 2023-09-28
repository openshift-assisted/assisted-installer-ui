import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import type { StateSliceWithMeta } from '../../types/state-slice';
import type { FeatureListType } from '../../../../common/features/featureGate';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../../common/features/featureGate';
import { externalFeaturesMappings } from '../../../config/external-features';
import { currentUserAsyncActions } from '../current-user/slice';
import { RootStateDay1 } from '../../store-day1';

const featureFlagsAsyncActions = {
  detectFeatures: createAsyncThunk(
    'featureFlags/detectFeatures',
    async (featuresOverride: FeatureListType | null = null, thunkApi) => {
      await thunkApi.dispatch(currentUserAsyncActions.getCapabilitiesAsync());
      const state = thunkApi.getState() as RootStateDay1;
      for (const { featureId, capabilityId } of externalFeaturesMappings) {
        const capability = state.currentUser.data?.organization?.capabilities?.find(
          (capability) => capability.name === capabilityId,
        );
        if (capability) {
          thunkApi.dispatch(
            featureFlagsActions.setFeatureFlag({
              featureId,
              isEnabled: capability.value === 'true',
            }),
          );
        }
      }
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
        if (/pending/.test(state.meta.status)) {
          featureFlagsActions.setMeta(action);
        }
        return state;
      });
      builder.addCase(rejected, (state, action) => {
        if (/pending/.test(state.meta.status)) {
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
