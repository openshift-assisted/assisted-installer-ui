import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getClusters, deleteCluster } from '../../api/clusters';
import { Cluster } from '../../api/types';
import { handleApiError } from '../../api/utils';
import { ResourceUIState } from '../../types';

export const fetchClustersAsync = createAsyncThunk('clusters/fetchClustersAsync', async () => {
  try {
    const { data } = await getClusters();
    return data;
  } catch (e) {
    return handleApiError(e, () => Promise.reject('Failed to fetch clusters.'));
  }
});

export const deleteClusterAsync = createAsyncThunk(
  'clusters/deleteClusterAsync',
  async (id: string) => {
    try {
      await deleteCluster(id);
      return id;
    } catch (e) {
      return handleApiError(e, () => Promise.reject('Failed to delete cluster'));
    }
  },
);

type ClustersStateSlice = {
  data: Cluster[];
  uiState: ResourceUIState;
};

const initialState: ClustersStateSlice = { data: [], uiState: ResourceUIState.LOADING };

export const clustersSlice = createSlice({
  initialState,
  name: 'clusters',
  reducers: {},
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
      }))
      .addCase(deleteClusterAsync.fulfilled, (state, action) => ({
        ...state,
        data: state.data.filter((item: Cluster) => item.id !== action.payload),
      }));
  },
});

export default clustersSlice.reducer;
