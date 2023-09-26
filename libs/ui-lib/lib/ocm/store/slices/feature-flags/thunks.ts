import { createAsyncThunk } from '@reduxjs/toolkit';
import type { FeatureListType } from '../../../../common';
import { featureFlagsActions } from './slice';
import { isInOcm } from '../../../../common';
import type { AsyncFeatureStatus } from './async-feature-status';
import type { FeatureStatus } from './feature-status';
import { toAsyncFeatureStatus } from './async-feature-status';
import { externalFeatures } from './external-features';

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
  async (featuresOverride: FeatureListType | null = null, { dispatch }) => {
    let internalFeatures: AsyncFeatureStatus[] = [];
    if (featuresOverride !== null) {
      internalFeatures = Object.entries(featuresOverride).map(toAsyncFeatureStatus);
    }

    const asyncFeaturesStatuses = isInOcm
      ? externalFeatures.concat(internalFeatures)
      : internalFeatures;
    const resolvedFeatureStatuses = await resolveAllAsyncFeatureStatuses(asyncFeaturesStatuses);
    for (const feature of resolvedFeatureStatuses) {
      dispatch(featureFlagsActions.setFeatureFlag(feature));
    }
  },
);
