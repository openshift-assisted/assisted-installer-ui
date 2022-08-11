import { useDispatch } from 'react-redux';
import { AssistedInstallerOCMPermissionTypesListType, Cluster } from '../../common';
import { ExtendedCluster, getBasePermissions, ocmPermissionsToAIPermissions } from '../config';
import { updateClusterPermissions } from '../reducers/clusters';

export default function useSetClusterPermissions() {
  const dispatch = useDispatch();

  const updatePermissions = (
    cluster?: Cluster,
    ocmPermissions?: AssistedInstallerOCMPermissionTypesListType,
  ) => {
    if (!cluster) {
      // When the cluster is cleaned, the state permissions are reset
      return;
    }
    let newPermissions = getBasePermissions(cluster as ExtendedCluster);
    if (ocmPermissions) {
      newPermissions = {
        ...newPermissions,
        ...ocmPermissionsToAIPermissions(ocmPermissions || {}),
      };
    }
    dispatch(updateClusterPermissions(newPermissions));
  };

  return updatePermissions;
}
