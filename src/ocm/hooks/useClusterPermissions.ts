import React from 'react';
import { AssistedInstallerPermissionTypesListType } from '../../common';

export default function useClusterPermissions() {
  const [permissions, setPermissions] = React.useState<AssistedInstallerPermissionTypesListType>();

  return {
    isViewerMode: !permissions?.canEdit,
    setPermissions,
  };
}
