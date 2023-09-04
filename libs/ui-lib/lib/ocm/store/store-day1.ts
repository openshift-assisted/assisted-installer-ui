import { configureStore } from '@reduxjs/toolkit';
import { clustersReducer } from './slices/clusters/slice';
import { currentClusterReducer } from './slices/current-cluster/slice';
import { infraEnvsReducer } from './slices/infra-envs/slice';
import { featureFlagsReducer } from './slices/feature-flags/slice';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../common';

export const storeDay1 = configureStore({
  devTools: {
    name: 'Assisted Installer - Day 1',
  },
  reducer: {
    clusters: clustersReducer,
    currentCluster: currentClusterReducer,
    infraEnvs: infraEnvsReducer,
    featureFlags: featureFlagsReducer,
  },
  preloadedState: {
    featureFlags: STANDALONE_DEPLOYMENT_ENABLED_FEATURES,
  },
});
export type RootStateDay1 = ReturnType<typeof storeDay1.getState>;
export type DispatchDay1 = typeof storeDay1.dispatch;
