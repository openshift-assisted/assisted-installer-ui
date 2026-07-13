import { CustomManifestValues, ListManifestsExtended, ManifestFormData } from '../data/dataTypes';

/** Manifests created by the installer (e.g. OVE defaults); not editable in the wizard. */
export const userProvidedManifests = <T extends { manifestSource?: string }>(
  manifests: T[] | undefined,
): T[] => (manifests ?? []).filter((m) => m.manifestSource !== 'system');

export const getManifestName = (manifestIdx: number) => `Custom manifest ${manifestIdx + 1}`;

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
  const userManifests = userProvidedManifests(manifests);
  if (userManifests.length > 0) {
    return getFormData(userManifests);
  }
  return getEmptyManifestsValues();
};

export const getEmptyManifestsValues = (): ManifestFormData => {
  return { manifests: [getEmptyManifest()] };
};

export const getClusterCustomManifests = (
  customManifests: ListManifestsExtended,
): CustomManifestValues[] => {
  const userManifests = userProvidedManifests(customManifests);
  if (userManifests.length > 0) {
    return userManifests.map((manifest) => ({
      folder: manifest.folder || 'manifests',
      filename: manifest.fileName || '',
      manifestYaml: manifest.yamlContent || '',
      created: true,
    }));
  } else {
    return [getEmptyManifest()];
  }
};
