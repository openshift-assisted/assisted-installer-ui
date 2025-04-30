import { TFunction } from 'i18next';
import { CustomManifestValues, ListManifestsExtended, ManifestFormData } from './types';

export const getManifestName = (manifestIdx: number, t: TFunction) => {
  return t('ai:Custom manifest {{num}}', { num: manifestIdx + 1 });
};

export const getFormData = (manifests: ListManifestsExtended): ManifestFormData => {
  return {
    manifests: getClusterCustomManifests(manifests),
  };
};

export const getEmptyManifest = (): CustomManifestValues => {
  return {
    folder: 'manifests',
    filename: '',
    manifestYaml: '',
    created: false,
  };
};

export const getManifestValues = (manifests: ListManifestsExtended): ManifestFormData => {
  if (!!manifests.length) {
    return getFormData(manifests);
  } else {
    return getEmptyManifestsValues();
  }
};

export const getEmptyManifestsValues = (): ManifestFormData => {
  return { manifests: [getEmptyManifest()] };
};

export const getClusterCustomManifests = (
  customManifests: ListManifestsExtended,
): CustomManifestValues[] => {
  if (customManifests && customManifests.length > 0) {
    return customManifests.map((manifest) => ({
      folder: manifest.folder || 'manifests',
      filename: manifest.fileName || '',
      manifestYaml: manifest.yamlContent || '',
      created: true,
    }));
  } else {
    return [getEmptyManifest()];
  }
};
