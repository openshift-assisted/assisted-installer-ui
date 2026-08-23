export type AssistedInstallerFeatureType = 'ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE';

export type FeatureListType = {
  [key in AssistedInstallerFeatureType]?: boolean;
};

export type AssistedInstallerOCMPermissionTypes = 'canEdit';
export type AssistedInstallerOCMPermissionTypesListType = {
  [key in AssistedInstallerOCMPermissionTypes]: boolean;
};
export type AssistedInstallerPermissionTypes = 'isViewerMode';
export type AssistedInstallerPermissionTypesListType = {
  [key in AssistedInstallerPermissionTypes]: boolean;
};

// Hardcoded outside OCM
export const STANDALONE_DEPLOYMENT_ENABLED_FEATURES: FeatureListType = {
  ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: false,
};
