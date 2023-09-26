import { useEffect } from 'react';
import { storeDay1 } from '../store';
import { detectFeatures } from '../store/slices/feature-flags/thunks';
import { FeatureListType } from '../../common';

function omitNonAssistedInstallerKeys(features: FeatureListType | null) {
  let result: FeatureListType | null = null;
  if (features !== null) {
    result = {};
    for (const [k, v] of Object.entries(features)) {
      if (k.startsWith('ASSISTED_INSTALLER')) {
        result[k as keyof FeatureListType] = v;
      }
    }
  }

  return result;
}

export function useFeatureDetection(overrides: FeatureListType | null = null) {
  useEffect(() => {
    if (overrides !== null) {
      void storeDay1.dispatch(detectFeatures(omitNonAssistedInstallerKeys(overrides)));
    }
  }, [overrides]);
}
