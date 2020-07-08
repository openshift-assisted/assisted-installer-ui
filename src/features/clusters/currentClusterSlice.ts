import _ from 'lodash';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCluster } from '../../api/clusters';
import { Cluster, Host } from '../../api/types';
import { handleApiError } from '../../api/utils';
import { ResourceUIState } from '../../types';

export const fetchClusterAsync = createAsyncThunk(
  'currentCluster/fetchClusterAsync',
  async (clusterId: string) => {
    try {
      const { data } = await getCluster(clusterId);
      return data;
    } catch (e) {
      return handleApiError(e, () => Promise.reject('Failed to fetch cluster.'));
    }
  },
);

type CurrentClusterStateSlice = {
  data?: Cluster;
  uiState: ResourceUIState;
  isReloadScheduled: number;
};

const initialState: CurrentClusterStateSlice = {
  data: undefined,
  uiState: ResourceUIState.LOADING,
  isReloadScheduled: 0,
};

export const currentClusterSlice = createSlice({
  initialState,
  name: 'currentCluster',
  reducers: {
    updateCluster: (state, action: PayloadAction<Cluster>) => ({ ...state, data: action.payload }),
    updateHost: (state, action: PayloadAction<Host>) => {
      const hostIndex = _.findIndex(state.data?.hosts, (host) => host.id === action.payload.id);
      if (hostIndex >= 0) {
        _.set(state, `data.hosts[${hostIndex}]`, action.payload);
      }
      return state;
    },
    cleanCluster: () => initialState,
    forceReload: (state) => ({
      ...state,
      isReloadScheduled: state.isReloadScheduled + 1,
    }),
    cancelForceReload: (state) => ({
      ...state,
      isReloadScheduled: 0,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClusterAsync.pending, (state) => ({
        ...state,
        uiState:
          state.uiState === ResourceUIState.LOADED
            ? ResourceUIState.RELOADING
            : ResourceUIState.LOADING,
      }))
      .addCase(fetchClusterAsync.fulfilled, (state, action) => ({
        ...state,
        data: action.payload as Cluster,
        uiState: ResourceUIState.LOADED,
      }))
      .addCase(fetchClusterAsync.rejected, (state) => ({
        ...state,
        uiState: ResourceUIState.ERROR,
      }));
  },
});

export const {
  updateCluster,
  updateHost,
  cleanCluster,
  forceReload,
  cancelForceReload,
} = currentClusterSlice.actions;
export default currentClusterSlice.reducer;
