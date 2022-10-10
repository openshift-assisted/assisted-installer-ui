import { configureStore } from '@reduxjs/toolkit';
import clustersReducer from '../reducers/clusters/clustersSlice';
import currentClusterReducer from '../reducers/clusters/currentClusterSlice';

export const store = configureStore({
  reducer: {
    clusters: clustersReducer,
    currentCluster: currentClusterReducer,
  },
  preloadedState: {},
});
export type RootState = ReturnType<typeof store.getState>;
