import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Cluster, ResourceUIState, POLLING_INTERVAL } from '../../../common';
import {
  fetchClusterAsync,
  cleanCluster,
  forceReload,
  cancelForceReload,
  FetchErrorType,
  ClusterDispatch,
} from '../../reducers/clusters';
import { selectCurrentClusterState } from '../../selectors';

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
  const dispatch = useDispatch<ClusterDispatch>();
  return React.useCallback(
    () => void dispatch(fetchClusterAsync(clusterId)),
    [clusterId, dispatch],
  );
};

export const useClusterPolling = (
  clusterId: string,
): {
  cluster: Cluster | undefined;
  uiState: ResourceUIState;
  errorDetail: FetchErrorType | undefined;
} => {
  const { isReloadScheduled, uiState, data, errorDetail } = useSelector(selectCurrentClusterState);
  const dispatch = useDispatch();
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
