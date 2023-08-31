import { configureStore } from '@reduxjs/toolkit';
import { infraEnvsReducer } from './slices/infra-envs/slice';
import { featureFlagsReducer } from './slices/feature-flags/slice';

export const storeDay2 = configureStore({
  reducer: {
    infraEnvs: infraEnvsReducer,
    featureFlags: featureFlagsReducer,
  },
});
export type RootStateDay2 = ReturnType<typeof storeDay2.getState>;
export type DispatchDay2 = typeof storeDay2.dispatch;
