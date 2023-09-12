import React from 'react';
import { ResourceUIState, POLLING_INTERVAL } from '../../../common';
import {
  fetchClusterAsync,
  cleanCluster,
  forceReload,
  cancelForceReload,
  FetchErrorType,
} from '../../store/slices/current-cluster/slice';
import { selectCurrentClusterState } from '../../store/slices/current-cluster/selectors';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { useDispatchDay1, useSelectorDay1 } from '../../store';

const shouldRefetch = (uiState: ResourceUIState, hasClusterData: boolean) => {
  if (uiState === ResourceUIState.POLLING_ERROR) {
    return hasClusterData;
  }
  return ![
    ResourceUIState.LOADING,
    ResourceUIState.RELOADING,
    ResourceUIState.UPDATE_ERROR,
  ].includes(uiState);
};

export const useFetchCluster = (clusterId: string) => {
  const dispatch = useDispatchDay1();
  return React.useCallback(() => {
    if (clusterId) {
      void dispatch(fetchClusterAsync(clusterId));
    }
  }, [clusterId, dispatch]);
};

export const useClusterPolling = (
  clusterId: string,
): {
  cluster: Cluster | undefined;
  uiState: ResourceUIState;
  errorDetail: FetchErrorType | undefined;
} => {
  const { isReloadScheduled, uiState, data, errorDetail } =
    useSelectorDay1(selectCurrentClusterState);
  const dispatch = useDispatchDay1();
  const fetchCluster = useFetchCluster(clusterId);
  const hasClusterData = !!data;

  React.useEffect(() => {
    if (isReloadScheduled && shouldRefetch(uiState, hasClusterData)) {
      fetchCluster();
    }
    dispatch(cancelForceReload());
  }, [fetchCluster, dispatch, isReloadScheduled, hasClusterData, uiState]);

  React.useEffect(() => {
    fetchCluster();
    const timer = window.setInterval(() => dispatch(forceReload()), POLLING_INTERVAL);
    return () => {
      clearInterval(timer);
      dispatch(cancelForceReload());
      dispatch(cleanCluster());
    };
  }, [dispatch, fetchCluster]);

  return { cluster: data, uiState, errorDetail };
};
