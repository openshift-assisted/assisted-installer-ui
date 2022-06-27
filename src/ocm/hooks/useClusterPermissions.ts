import { useDispatch, useSelector } from 'react-redux';
import { AssistedInstallerOCMPermissionTypesListType, Cluster } from '../../common';
import { ExtendedCluster, getBasePermissions, ocmPermissionsToAIPermissions } from '../config';
import { updateClusterPermissions } from '../reducers/clusters';
import { selectCurrentClusterState } from '../selectors';

export default function useClusterPermissions() {
  const dispatch = useDispatch();

  const { permissions } = useSelector(selectCurrentClusterState);

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
    ...permissions,
    setPermissions: updatePermissions,
  };
}
