import { createSelector } from '@reduxjs/toolkit';
import type { Selector } from 'reselect';
import type { RootStateDay1 } from '../../store-day1';
import type { CpuArchitecture } from '../../../../common';
import type { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

export const selectInfraEnvsSlice = (state: RootStateDay1) => state.infraEnvs;
export const selectInfraEnvByCpuArchitecture = createSelector(
  [selectInfraEnvsSlice, (_: RootStateDay1, cpuArchitecture: CpuArchitecture) => cpuArchitecture],
  (infraEnvs, cpuArchitecture): InfraEnv | undefined =>
    infraEnvs.find((infraEnv) => infraEnv.cpuArchitecture === cpuArchitecture),
) as Selector<RootStateDay1, InfraEnv | undefined, [CpuArchitecture]>;
