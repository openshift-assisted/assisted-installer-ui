import {
  AssistedInstallerOCMPermissionTypesListType,
  AssistedInstallerPermissionTypesListType,
} from '../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

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
  if (!process.env.AIUI_APP_CLUSTER_PERMISSIONS) {
    return basePermissions;
  }
  const ocmPermissions = JSON.parse(
    process.env.AIUI_APP_CLUSTER_PERMISSIONS,
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
