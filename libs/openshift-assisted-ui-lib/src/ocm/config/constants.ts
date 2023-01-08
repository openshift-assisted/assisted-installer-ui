import {
  AssistedInstallerOCMPermissionTypesListType,
  AssistedInstallerPermissionTypesListType,
  Cluster,
} from '../../common';

export const isSingleClusterMode = () => {
  return import.meta.env.VITE_APP_BUILD_MODE === 'single-cluster';
};

/* Used from Integration tests so we can mock the permissions */
export type ExtendedCluster = Cluster & {
  permissions: AssistedInstallerOCMPermissionTypesListType;
};

export const getBasePermissions = (
  cluster: ExtendedCluster,
): AssistedInstallerPermissionTypesListType => {
  if (cluster.permissions) {
    return { isViewerMode: !cluster.permissions.canEdit };
  }

  const basePermissions = { isViewerMode: false };
  if (!import.meta.env.VITE_APP_CLUSTER_PERMISSIONS) {
    return basePermissions;
  }
  const ocmPermissions = JSON.parse(
    import.meta.env.VITE_APP_CLUSTER_PERMISSIONS,
  ) as AssistedInstallerOCMPermissionTypesListType;

  return {
    ...basePermissions,
    ...ocmPermissionsToAIPermissions(ocmPermissions),
  };
};

export const ocmPermissionsToAIPermissions = (
  ocmPermissions: AssistedInstallerOCMPermissionTypesListType,
): Partial<AssistedInstallerPermissionTypesListType> => {
  const permissions: Partial<AssistedInstallerPermissionTypesListType> = {};
  if (ocmPermissions.canEdit !== undefined) {
    permissions.isViewerMode = !ocmPermissions.canEdit;
  }
  return permissions;
};

export const OCM_CLUSTER_LIST_LINK = '/openshift'; // TODO(mlibra): Tweak it!!!
