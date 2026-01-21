import { createSelector } from '@reduxjs/toolkit';
import type { RootStateDay1 } from '../../store-day1';
import type { CpuArchitecture } from '@openshift-assisted/common';

export const selectInfraEnvsSlice = (state: RootStateDay1) => state.infraEnvs;
export const selectInfraEnvByCpuArchitecture = createSelector(
  [selectInfraEnvsSlice, (_: RootStateDay1, cpuArchitecture: CpuArchitecture) => cpuArchitecture],
  (infraEnvs, cpuArchitecture) =>
    infraEnvs.find((infraEnv) => infraEnv.cpuArchitecture === cpuArchitecture),
);
