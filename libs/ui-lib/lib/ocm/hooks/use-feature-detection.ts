import type {
  AssistedInstallerFeatureType,
  FeatureListType,
} from '../../common/features/featureGate';
import { useSelectorDay1 } from '../store';
import { isFeatureEnabled } from '../store/slices/feature-flags/selectors';
import { featureFlagsAsyncActions } from '../store/slices/feature-flags/slice';
import { storeDay1 } from '../store/store-day1';
import { useEffect } from 'react';

export function useFeatureDetection<T extends Partial<Record<string, boolean> & FeatureListType>>(
  overrides: T | null = null,
) {
  useEffect(() => {
    const onlyAssistedInstallerFeatures = Object.fromEntries(
      Object.entries(overrides ?? {}).filter(([k, _v]) => k.startsWith('ASSISTED_INSTALLER')),
    );
    void storeDay1.dispatch(
      featureFlagsAsyncActions.detectFeaturesAsync(onlyAssistedInstallerFeatures),
    );
  }, [overrides]);
}

export const useFeature = (feature: AssistedInstallerFeatureType): boolean => {
  return useSelectorDay1(isFeatureEnabled(feature));
};
