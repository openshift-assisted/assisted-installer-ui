import {
  AssistedInstallerOCMPermissionTypesListType,
  AssistedInstallerPermissionTypesListType,
} from '../../common';

export const isSingleClusterMode = () => {
  return process.env.REACT_APP_BUILD_MODE === 'single-cluster';
};

export const getBasePermissions = (): AssistedInstallerPermissionTypesListType => {
  const basePermissions = { isViewerMode: false };
  if (!process.env.REACT_APP_CLUSTER_PERMISSIONS) {
    return basePermissions;
  }
  const ocmPermissions = JSON.parse(process.env.REACT_APP_CLUSTER_PERMISSIONS);
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
