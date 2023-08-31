import { AssistedInstallerPermissionTypesListType } from '../../../../common';
import { RootStateDay1 } from '../../store-day1';

export const selectCurrentClusterState = (state: RootStateDay1) => state.currentCluster;
export const selectCurrentCluster = (state: RootStateDay1) => state.currentCluster.data;
export const selectCurrentClusterUIState = (state: RootStateDay1) => state.currentCluster.uiState;
export const selectIsCurrentClusterSNO = (state: RootStateDay1) =>
  state.currentCluster.data?.highAvailabilityMode === 'None';
export const selectCurrentClusterPermissionsState = (
  state: RootStateDay1,
): AssistedInstallerPermissionTypesListType => {
  if (state.currentCluster) {
    return state.currentCluster.permissions;
  }
  // This shouldn't happen, but to be on the safe side, return the default permissions
  return { isViewerMode: false };
};
