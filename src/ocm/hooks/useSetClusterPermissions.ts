import { useDispatch } from 'react-redux';
import { AssistedInstallerOCMPermissionTypesListType, Cluster } from '../../common';
import { ExtendedCluster, getBasePermissions, ocmPermissionsToAIPermissions } from '../config';
import { updateClusterPermissions } from '../reducers/clusters';

export default function useSetClusterPermissions() {
  const dispatch = useDispatch();

  return (cluster?: Cluster, ocmPermissions?: AssistedInstallerOCMPermissionTypesListType) => {
    if (!cluster) {
      // We must not update the permissions, the state is reset when the cluster is cleaned
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
}
