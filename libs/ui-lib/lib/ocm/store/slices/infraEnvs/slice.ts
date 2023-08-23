import type { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { createSlice } from '@reduxjs/toolkit';

// This slice holds a list of infra-envs where each one has a different cpuArchitecture.
// There should be no repetitions.
const infraEnvsSlice = createSlice({
  name: 'infraEnvs',
  initialState: [] as InfraEnv[],
  reducers: {},
});

export const infraEnvsActions = infraEnvsSlice.actions;
export const infraEnvsReducer = infraEnvsSlice.reducer;
