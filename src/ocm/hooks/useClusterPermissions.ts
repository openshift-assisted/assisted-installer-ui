import { useDispatch, useSelector } from 'react-redux';
import { AssistedInstallerOCMPermissionTypesListType } from '../../common';
import { getBasePermissions, ocmPermissionsToAIPermissions } from '../config';
import { updateClusterPermissions } from '../reducers/clusters';
import { selectCurrentClusterState } from '../selectors';

export default function useClusterPermissions() {
  const dispatch = useDispatch();

  const { permissions } = useSelector(selectCurrentClusterState);

  const updatePermissions = (ocmPermissions?: AssistedInstallerOCMPermissionTypesListType) => {
    let newPermissions = getBasePermissions();
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
