import _ from 'lodash';
import * as ReduxToolkit from '@reduxjs/toolkit';
import { getCluster } from '../../api/clusters';
import { Cluster, Host } from '../../api/types';
import { handleApiError } from '../../api/utils';
import { ResourceUIState } from '../../types';

// workaround for TS2742 issue
const { createSlice, createAsyncThunk } = ReduxToolkit;

type RetrievalErrorType = {
  code: string;
};

type CurrentClusterStateSlice = {
  data?: Cluster;
  uiState: ResourceUIState;
  isReloadScheduled: number;
  errorDetail?: RetrievalErrorType;
};

export const fetchClusterAsync = createAsyncThunk(
  'currentCluster/fetchClusterAsync',
  async (clusterId: string, { rejectWithValue }) => {
    try {
      const { data } = await getCluster(clusterId);
      return data;
    } catch (e) {
      return handleApiError(e, () => rejectWithValue(e.response.data));
    }
  },
);

const initialState: CurrentClusterStateSlice = {
  data: undefined,
  uiState: ResourceUIState.LOADING,
  errorDetail: undefined,
  isReloadScheduled: 0,
};

export const currentClusterSlice: ReduxToolkit.Slice = createSlice({
  initialState,
  name: 'currentCluster',
  reducers: {
    updateCluster: (state, action: ReduxToolkit.PayloadAction<Cluster>) => ({
      ...state,
      data: action.payload,
    }),
    updateHost: (state, action: ReduxToolkit.PayloadAction<Host>) => {
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
      .addCase(fetchClusterAsync.rejected, (state, action) => ({
        ...state,
        uiState: ResourceUIState.ERROR,
        errorDetail: action.payload as RetrievalErrorType,
      }));
  },
});

export const cancelForceReload = () => currentClusterSlice.actions.cancelForceReload(null);
export const cleanCluster = () => currentClusterSlice.actions.cleanCluster(null);
export const forceReload = () => currentClusterSlice.actions.forceReload(null);
export const { updateCluster, updateHost } = currentClusterSlice.actions;
export default currentClusterSlice.reducer;
