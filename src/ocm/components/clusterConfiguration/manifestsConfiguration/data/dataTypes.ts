import { Manifest } from '../../../../../common';

export type FormViewManifestFolder = 'manifests' | 'openshift';

export type CustomManifestValues = {
  folder: FormViewManifestFolder;
  filename: string;
  manifestYaml: string;
  fakeId?: string;
};

export interface ManifestFormData {
  manifests: CustomManifestValues[];
}

export interface ManifestExtended extends Manifest {
  yamlContent?: string;
}

export type ListManifestsExtended = ManifestExtended[];
