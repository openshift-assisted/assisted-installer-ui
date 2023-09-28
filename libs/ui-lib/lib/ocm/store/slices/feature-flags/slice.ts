import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import type { StateSliceWithMeta } from '../../types/state-slice';
import type { FeatureStatus } from './types/feature-status';
import type {
  FeatureListType,
  AssistedInstallerFeatureType,
} from '../../../../common/features/featureGate';
import type { CaseReducer } from '@reduxjs/toolkit';
import type { AsyncFeatureStatus } from './types/async-feature-status';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../../common/features/featureGate';
import { isInOcm } from '../../../../common';
import { externalFeatures } from '../../../config/external-features';

const updateMeta: CaseReducer<
  FeatureFlagsState,
  ReturnType<DetectFeaturesAsyncThunkActionCreators>
> = (state, action) => {
  state.meta.status = action.meta.requestStatus;
  state.meta.currentRequestId = action.meta.requestId;
  state.meta.updatedAt = new Date().toUTCString();
};

async function resolveAllAsyncFeatureStatuses(
  features: AsyncFeatureStatus[],
): Promise<FeatureStatus[]> {
  const result: FeatureStatus[] = [];
  const promiseResults = await Promise.allSettled(features.map(({ isEnabled }) => isEnabled()));
  for (let i = 0; i < promiseResults.length; i++) {
    const currentPromiseResult = promiseResults[i];
    const name = features[i].name;
    const isEnabled =
      currentPromiseResult.status === 'fulfilled' ? currentPromiseResult.value : false;
    result.push({ name, isEnabled });
  }

  return result;
}

export const detectFeatures = createAsyncThunk(
  'featureFlags/detectFeatures',
  async (featuresOverride: FeatureListType | null = null, thunkApi) => {
    let internalFeatures: AsyncFeatureStatus[] = [];
    if (featuresOverride !== null) {
      internalFeatures = Object.entries(featuresOverride).map(
        ([name, isEnabled]): AsyncFeatureStatus => ({
          name: name as AssistedInstallerFeatureType,
          isEnabled: () => Promise.resolve(isEnabled),
        }),
      );
    }

    const asyncFeaturesStatuses = isInOcm
      ? externalFeatures.concat(internalFeatures)
      : internalFeatures;
    const resolvedFeatureStatuses = await resolveAllAsyncFeatureStatuses(asyncFeaturesStatuses);
    for (const feature of resolvedFeatureStatuses) {
      thunkApi.dispatch(featureFlagsActions.setFeatureFlag(feature));
    }
  },
);

export type DetectFeaturesAsyncThunkActionCreators =
  | (typeof detectFeatures)['pending']
  | (typeof detectFeatures)['fulfilled']
  | (typeof detectFeatures)['rejected'];

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
