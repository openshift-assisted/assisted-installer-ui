import { useSelectorDay1 } from '../store';
import { isFeatureEnabled } from '../store/slices/feature-flags/selectors';
import { AssistedInstallerFeatureType } from './types';

export const useFeature = (feature: AssistedInstallerFeatureType): boolean => {
  return useSelectorDay1(isFeatureEnabled(feature));
};
