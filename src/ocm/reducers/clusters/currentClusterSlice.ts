import findIndex from 'lodash/findIndex';
import set from 'lodash/set';
import { AxiosError } from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AssistedInstallerPermissionTypesListType,
  Cluster,
  Host,
  ResourceUIState,
} from '../../../common';
import {
  getApiErrorMessage,
  getApiErrorCode,
  handleApiError,
  FETCH_ABORTED_ERROR_CODE,
} from '../../api';
import { ClustersService } from '../../services';

export type FetchErrorType = {
  code: string | number;
  message: string;
};

type CurrentClusterStateSlice = {
  data?: Cluster;
  uiState: ResourceUIState;
  isReloadScheduled: number;
  permissions: AssistedInstallerPermissionTypesListType;
  errorDetail?: FetchErrorType;
};

export const fetchClusterAsync = createAsyncThunk<
  Cluster | void,
  string,
  {
    rejectValue: FetchErrorType;
  }
>('currentCluster/fetchClusterAsync', async (clusterId, { rejectWithValue }) => {
  try {
    const cluster = await ClustersService.get(clusterId);
    return cluster;
  } catch (e) {
    return handleApiError(e, () => {
      return rejectWithValue({
        code: getApiErrorCode(e as Error | AxiosError),
        message: getApiErrorMessage(e),
      });
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
      .addCase(fetchClusterAsync.rejected, (state, action) => {
        const error = action.payload as FetchErrorType;
        if (error.code === FETCH_ABORTED_ERROR_CODE) {
          // The request was aborted as the cluster was being updated by PATCH / DELETE etc requests
          return {
            ...state,
            uiState: state.data ? ResourceUIState.LOADED : ResourceUIState.LOADED,
          };
        }
        return {
          ...state,
          uiState: ResourceUIState.ERROR,
          errorDetail: error,
        };
      });
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
