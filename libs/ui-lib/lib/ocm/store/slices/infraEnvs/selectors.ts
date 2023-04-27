import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../index';
import type { CpuArchitecture } from '../../../../common';

export const selectInfraEnvsSlice = (state: RootState) => state.infraEnvs;
export const selectInfraEnvByCpuArchitecture = createSelector(
  [selectInfraEnvsSlice, (_: RootState, cpuArchitecture: CpuArchitecture) => cpuArchitecture],
  (infraEnvs, cpuArchitecture) =>
    infraEnvs.find((infraEnv) => infraEnv.cpuArchitecture === cpuArchitecture),
);
