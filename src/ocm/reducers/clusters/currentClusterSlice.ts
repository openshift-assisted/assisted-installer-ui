import findIndex from 'lodash/findIndex';
import set from 'lodash/set';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AssistedInstallerPermissionTypesListType,
  Cluster,
  Host,
  ResourceUIState,
} from '../../../common';
import { getApiErrorMessage, handleApiError } from '../../api';
import { ClustersService } from '../../services';

export type RetrievalErrorType = {
  code: string;
};

type CurrentClusterStateSlice = {
  data?: Cluster;
  uiState: ResourceUIState;
  isReloadScheduled: number;
  permissions: AssistedInstallerPermissionTypesListType;
  errorDetail?: RetrievalErrorType;
};

export const fetchClusterAsync = createAsyncThunk<
  Cluster | void,
  string,
  {
    rejectValue: RetrievalErrorType;
  }
>('currentCluster/fetchClusterAsync', async (clusterId, { rejectWithValue }) => {
  try {
    const cluster = await ClustersService.get(clusterId);
    return cluster;
  } catch (e) {
    return handleApiError(e, () => {
      const rejectError = getApiErrorMessage(e);
      return rejectWithValue(rejectError as unknown as RetrievalErrorType);
    });
  }
});

const initialState: CurrentClusterStateSlice = {
  data: undefined,
  uiState: ResourceUIState.LOADING,
  permissions: { isViewerMode: false },
  errorDetail: undefined,
  isReloadScheduled: 0,
};

export const currentClusterSlice = createSlice({
  initialState,
  name: 'currentCluster',
  reducers: {
    updateClusterBase: (state, action: PayloadAction<Cluster>) => {
      // Should not overwrite the hosts once they are created
      const originalHosts = state.data?.hosts || [];
      return { ...state, data: { ...action.payload, hosts: originalHosts } };
    },
    updateCluster: (state, action: PayloadAction<Cluster>) => {
      return { ...state, data: action.payload };
    },
    updateHost: (state, action: PayloadAction<Host>) => {
      const hostIndex = findIndex(state.data?.hosts, (host) => host.id === action.payload.id);

      if (hostIndex >= 0) {
        set(state, `data.hosts[${hostIndex}]`, action.payload);
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
    updateClusterPermissions: (
      state,
      action: PayloadAction<AssistedInstallerPermissionTypesListType>,
    ) => ({
      ...state,
      permissions: action.payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClusterAsync.pending, (state) => {
        const needsReload =
          state.uiState === ResourceUIState.LOADED ||
          (state.uiState === ResourceUIState.ERROR && state.data);
        return {
          ...state,
          uiState: needsReload ? ResourceUIState.RELOADING : ResourceUIState.LOADING,
        };
      })
      .addCase(fetchClusterAsync.fulfilled, (state, action) => {
        return {
          ...state,
          data: action.payload as Cluster,
          uiState: ResourceUIState.LOADED,
        };
      })
      .addCase(fetchClusterAsync.rejected, (state, action) => ({
        ...state,
        uiState: ResourceUIState.ERROR,
        errorDetail: action.payload as RetrievalErrorType,
      }));
  },
});

export const {
  updateCluster,
  updateClusterBase,
  updateHost,
  cleanCluster,
  forceReload,
  cancelForceReload,
  updateClusterPermissions,
} = currentClusterSlice.actions;
export default currentClusterSlice.reducer;
