import * as ReduxToolkit from '@reduxjs/toolkit';
import { getClusters } from '../../api/clusters';
import { Cluster } from '../../api/types';
import { handleApiError } from '../../api/utils';
import { ResourceUIState } from '../../types';

// workaround for TS2742 issue
const { createSlice, createAsyncThunk } = ReduxToolkit;

export const fetchClustersAsync = createAsyncThunk('clusters/fetchClustersAsync', async () => {
  try {
    const { data } = await getClusters();
    return data;
  } catch (e) {
    return handleApiError(e, () => Promise.reject('Failed to fetch clusters.'));
  }
});

type ClustersStateSlice = {
  data: Cluster[];
  uiState: ResourceUIState;
};

const initialState: ClustersStateSlice = { data: [], uiState: ResourceUIState.LOADING };

export const clustersSlice: ReduxToolkit.Slice = createSlice({
  initialState,
  name: 'clusters',
  reducers: {
    deleteCluster: (state, action: ReduxToolkit.PayloadAction<Cluster['id']>) => ({
      ...state,
      data: state.data.filter((item: Cluster) => item.id !== action.payload),
    }),
  },
  extraReducers: (builder) => {
    const { LOADED, LOADING, RELOADING, ERROR } = ResourceUIState;
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
        uiState: ERROR,
      }));
  },
});

export const { deleteCluster } = clustersSlice.actions;
export default clustersSlice.reducer;
