import { SupportLevels } from '../api';

export enum CpuArchitecture {
  x86 = 'x86_64',
  ARM = 'arm64',
  MULTI = 'multi',
  // This value refers to use whichever CPU architecture was selected for the cluster
  // It's not a value that can be returned from the Backend.
  USE_DAY1_ARCHITECTURE = 'cluster-day1-cpu-architecture',
  ppc64le = 'ppc64le',
  s390x = 's390x',
}
export enum OcmCpuArchitecture {
  x86 = 'amd64',
  ARM = 'arm64',
  MULTI = 'multi',
  ppc64le = 'ppc64le',
  s390x = 's390x',
}

type CpuArchitectureFeatureIds =
  | 'arm64Architecture'
  | 'ppc64LeArchitecture'
  | 's390XArchitecture'
  | 'x86_64Architecture';

export const featureIdToCpuArchitecture: Record<
  CpuArchitectureFeatureIds,
  SupportedCpuArchitecture
> = {
  arm64Architecture: CpuArchitecture.ARM,
  ppc64LeArchitecture: CpuArchitecture.ppc64le,
  s390XArchitecture: CpuArchitecture.s390x,
  x86_64Architecture: CpuArchitecture.x86,
};

export type SupportedCpuArchitecture = Extract<
  CpuArchitecture,
  CpuArchitecture.x86 | CpuArchitecture.ARM | CpuArchitecture.ppc64le | CpuArchitecture.s390x
>;

export const getSupportedCpuArchitectures = (): SupportedCpuArchitecture[] => [
  CpuArchitecture.x86,
  CpuArchitecture.ARM,
  CpuArchitecture.ppc64le,
  CpuArchitecture.s390x,
];

export const getNewSupportedCpuArchitectures = (
  cpuArchitectures: SupportLevels,
  canSelectCpuArch: boolean,
): SupportedCpuArchitecture[] => {
  const newSupportedCpuArchs: SupportedCpuArchitecture[] = [];
  if (canSelectCpuArch) {
    const supportedFeatureIdCpuArchs = Object.keys(cpuArchitectures.architectures).filter(
      (archFeatureId) =>
        cpuArchitectures.architectures[archFeatureId] !== 'unsupported' &&
        archFeatureId !== 'multiarchReleaseImage',
    );
    supportedFeatureIdCpuArchs.forEach((archFeatureId) => {
      newSupportedCpuArchs.push(
        featureIdToCpuArchitecture[archFeatureId] as SupportedCpuArchitecture,
      );
    });
  } else {
    newSupportedCpuArchs.push(CpuArchitecture.x86);
  }
  return newSupportedCpuArchs;
};

export const getDefaultCpuArchitecture = (): SupportedCpuArchitecture => CpuArchitecture.x86;
