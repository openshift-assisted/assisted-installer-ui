import { Manifest } from '@openshift-assisted/types/assisted-installer-service';

export type FormViewManifestFolder = 'manifests' | 'openshift';

export type CustomManifestValues = {
  folder: FormViewManifestFolder;
  filename: string;
  manifestYaml: string;
};

export interface ManifestFormData {
  manifests: CustomManifestValues[];
}

export interface ManifestExtended extends Manifest {
  yamlContent?: string;
}

export type ListManifestsExtended = ManifestExtended[];
