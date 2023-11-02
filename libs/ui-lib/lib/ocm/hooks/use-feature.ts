import { AssistedInstallerFeatureType } from '../../common';
import { useSelectorDay1 } from '../store';
import { isFeatureEnabled } from '../store/slices/feature-flags/selectors';

export const useFeature = (feature: AssistedInstallerFeatureType): boolean => {
  return useSelectorDay1(isFeatureEnabled(feature));
};
