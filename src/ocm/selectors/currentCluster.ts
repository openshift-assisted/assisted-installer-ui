import { AssistedInstallerPermissionTypesListType } from '../../common';
import { RootState } from '../store';

export const selectCurrentClusterState = (state: RootState) => state.currentCluster;
export const selectCurrentCluster = (state: RootState) => state.currentCluster.data;
export const selectCurrentClusterUIState = (state: RootState) => state.currentCluster.uiState;
export const selectIsCurrentClusterSNO = (state: RootState) =>
  state.currentCluster.data?.highAvailabilityMode === 'None';
export const selectCurrentClusterPermissionsState = (
  state: RootState,
): AssistedInstallerPermissionTypesListType => {
  if (state.currentCluster) {
    return state.currentCluster.permissions;
  }
  // This shouldn't happen, but to be on the safe side, return the default permissions
  return { isViewerMode: false };
};
