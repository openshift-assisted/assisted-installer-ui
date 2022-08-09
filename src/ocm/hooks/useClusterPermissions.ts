import { useDispatch } from 'react-redux';
import { AssistedInstallerOCMPermissionTypesListType, Cluster } from '../../common';
import { ExtendedCluster, getBasePermissions, ocmPermissionsToAIPermissions } from '../config';
import { updateClusterPermissions } from '../reducers/clusters';

export default function useClusterPermissions() {
  const dispatch = useDispatch();

  const updatePermissions = (
    ocmPermissions?: AssistedInstallerOCMPermissionTypesListType,
    cluster?: Cluster,
  ) => {
    let newPermissions = getBasePermissions(cluster as ExtendedCluster);
    if (ocmPermissions) {
      newPermissions = {
        ...newPermissions,
        ...ocmPermissionsToAIPermissions(ocmPermissions || {}),
      };
    }
    dispatch(updateClusterPermissions(newPermissions));
  };

  return {
    setPermissions: updatePermissions,
  };
}
