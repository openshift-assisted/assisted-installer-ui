import type { InfraEnv } from '../../../../common';
import { createSlice } from '@reduxjs/toolkit';

// This slice holds a list of infra-envs where each one has a different cpuArchitecture.
// There should be no repetitions.
const infraEnvsSlice = createSlice({
  name: 'infraEnvs',
  initialState: [] as InfraEnv[],
  reducers: {},
  extraReducers: {},
});

export const infraEnvsActions = infraEnvsSlice.actions;
export const infraEnvsReducer = infraEnvsSlice.reducer;
