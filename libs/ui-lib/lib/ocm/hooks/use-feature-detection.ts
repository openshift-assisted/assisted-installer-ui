import type { FeatureListType } from '../../common/features/featureGate';
import { detectFeatures } from '../store/slices/feature-flags/thunks';
import { storeDay1 } from '../store/store-day1';
import { useEffect } from 'react';

function toAssistedInstallerFeaturesOnly(
  accumulator: FeatureListType,
  currentValue: [string, boolean],
): FeatureListType {
  const [k, v] = currentValue;
  if (k.startsWith('ASSISTED_INSTALLER')) {
    accumulator[k as keyof FeatureListType] = v;
  }

  return accumulator;
}

export function useFeatureDetection<T extends FeatureListType>(overrides: T | null = null) {
  useEffect(() => {
    let features: FeatureListType | null = null;
    if (overrides !== null) {
      features = Object.entries(overrides).reduce(
        toAssistedInstallerFeaturesOnly,
        {} as FeatureListType,
      );
    }
    void storeDay1.dispatch(detectFeatures(features));
  }, [overrides]);
}
