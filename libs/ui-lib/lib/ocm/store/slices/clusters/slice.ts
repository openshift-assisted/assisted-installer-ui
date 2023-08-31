import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  ThunkDispatch,
  AnyAction,
  Dispatch,
} from '@reduxjs/toolkit';
import { ResourceUIState } from '../../../../common';
import { ClustersAPI } from '../../../services/apis';
import { handleApiError, isInOcm } from '../../../api';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const fetchClustersAsync = createAsyncThunk<Cluster[] | void>(
  'clusters/fetchClustersAsync',
  async (value, { rejectWithValue }) => {
    try {
      const { data } = await ClustersAPI.list();
      return data.filter((cluster) => (isInOcm ? cluster.kind === 'Cluster' : true));
    } catch (e) {
      return handleApiError(e, () => rejectWithValue(value));
    }
  },
);

type ClustersStateSlice = {
  data: Cluster[];
  uiState: ResourceUIState;
};

export type ClustersDispatch = ThunkDispatch<ClustersStateSlice, undefined, AnyAction> & Dispatch;

const initialState: ClustersStateSlice = { data: [], uiState: ResourceUIState.LOADING };

export const clustersSlice = createSlice({
  initialState,
  name: 'clusters',
  reducers: {
    deleteCluster: (state, action: PayloadAction<Cluster['id']>) => ({
      ...state,
      data: state.data.filter((item: Cluster) => item.id !== action.payload),
    }),
  },
  extraReducers: (builder) => {
    const { LOADED, LOADING, RELOADING, POLLING_ERROR } = ResourceUIState;
    builder
      .addCase(fetchClustersAsync.pending, (state) => {
        const uiState = state.uiState === LOADED ? RELOADING : LOADING;
        return { ...state, uiState };
      })
      .addCase(fetchClustersAsync.fulfilled, (state, action) => ({
        ...state,
        data: [...(action.payload as Cluster[])],
        uiState: LOADED,
      }))
      .addCase(fetchClustersAsync.rejected, (state) => ({
        ...state,
        uiState: POLLING_ERROR,
      }));
  },
});

const { actions, reducer } = clustersSlice;
export const { deleteCluster } = actions;
export const clustersReducer = reducer;
