import { configureStore } from '@reduxjs/toolkit';
import { infraEnvsReducer } from './slices/infra-envs/slice';
import { featureFlagsReducer } from './slices/feature-flags/slice';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../common';

export const storeDay2 = configureStore({
  devTools: {
    name: 'Assisted Installer - Day 2',
  },
  reducer: {
    infraEnvs: infraEnvsReducer,
    featureFlags: featureFlagsReducer,
  },
  preloadedState: {
    featureFlags: STANDALONE_DEPLOYMENT_ENABLED_FEATURES,
  },
});
export type RootStateDay2 = ReturnType<typeof storeDay2.getState>;
export type DispatchDay2 = typeof storeDay2.dispatch;
