import { CustomManifestValues, ListManifestsExtended, ManifestFormData } from '../data/dataTypes';

export const getManifestName = (manifestIdx: number) => `Custom manifest ${manifestIdx + 1}`;

export const getFormData = (manifests: ListManifestsExtended): ManifestFormData => {
  return {
    manifests: getClusterCustomManifests(manifests),
  };
};

export const getEmptyFormViewManifest = (): CustomManifestValues => {
  return {
    folder: 'manifests',
    filename: '',
    manifestYaml: '',
    fakeId: '',
  };
};

export const getFormViewManifestValues = (manifests: ListManifestsExtended): ManifestFormData => {
  const formData = getFormData(manifests);
  if (!formData.manifests.length) {
    return { manifests: [getEmptyFormViewManifest()] };
  }
  return { manifests: formData.manifests };
};

export const getEmptyFormViewManifestsValues = (): ManifestFormData => {
  return { manifests: [getEmptyFormViewManifest()] };
};

export const getClusterCustomManifests = (
  customManifests: ListManifestsExtended,
): CustomManifestValues[] => {
  if (customManifests && customManifests.length > 0) {
    return customManifests.map((manifest) => ({
      folder: manifest.folder || 'manifests',
      filename: manifest.fileName || '',
      manifestYaml: manifest.yamlContent || '',
      fakeId: getManifestFakeId(manifest.folder || 'manifests', manifest.fileName || ''),
    }));
  } else {
    return [getEmptyFormViewManifest()];
  }
};

export const getManifestFakeId = (folder: string, fileName: string): string => {
  return `${folder}#${fileName}`;
};
