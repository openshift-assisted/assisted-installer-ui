import type { CaseReducer } from '@reduxjs/toolkit';
import type { FeatureListType } from '../../../../common/features/featureGate';
import type { AssistedInstallerFeatureType } from '../../../../common/features/featureGate';
import type { AsyncFeatureStatus } from './types/async-feature-status';
import type { FeatureStatus } from './types/feature-status';
import type { FeatureFlagsState } from './slice';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { featureFlagsActions } from './slice';
import { isInOcm } from '../../../../common/api/axiosClient';
import { externalFeatures } from '../../../config/external-features';

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

type DetectFeaturesAsyncThunkActionCreators =
  | (typeof detectFeatures)['pending']
  | (typeof detectFeatures)['fulfilled']
  | (typeof detectFeatures)['rejected'];
export const updateMeta: CaseReducer<
  FeatureFlagsState,
  ReturnType<DetectFeaturesAsyncThunkActionCreators>
> = (state, action) => {
  state.meta.status = action.meta.requestStatus;
  state.meta.currentRequestId = action.meta.requestId;
  state.meta.updatedAt = new Date().toUTCString();
};
