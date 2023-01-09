import { configureStore } from '@reduxjs/toolkit';
import clustersReducer from '../reducers/clusters/clustersSlice';
import currentClusterReducer from '../reducers/clusters/currentClusterSlice';
import { infraEnvsReducer } from './slices/infraEnvs/slice';

export const store = configureStore({
  reducer: {
    clusters: clustersReducer,
    currentCluster: currentClusterReducer,
    infraEnvs: infraEnvsReducer,
  },
  preloadedState: {},
});
export type RootState = ReturnType<typeof store.getState>;
export type DispatchDay1 = typeof store.dispatch;

export const storeDay2 = configureStore({
  reducer: {
    infraEnvs: infraEnvsReducer,
  },
});
export type RootStateDay2 = ReturnType<typeof storeDay2.getState>;
export type DispatchDay2 = typeof storeDay2.dispatch;
