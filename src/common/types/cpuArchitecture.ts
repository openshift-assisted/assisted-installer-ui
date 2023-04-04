import { ArchitectureSupportLevelId, SupportLevel } from '../api';

export type ClusterCpuArchitecture = 'x86_64' | 'aarch64' | 'arm64' | 'ppc64le' | 's390x' | 'multi';

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

export const featureIdToCpuArchitecture: Record<
  ArchitectureSupportLevelId,
  SupportedCpuArchitecture
> = {
  ARM64_ARCHITECTURE: CpuArchitecture.ARM,
  PPC64LE_ARCHITECTURE: CpuArchitecture.ppc64le,
  S390X_ARCHITECTURE: CpuArchitecture.s390x,
  X86_64_ARCHITECTURE: CpuArchitecture.x86,
  MULTIARCH_RELEASE_IMAGE: CpuArchitecture.x86,
};

export type SupportedCpuArchitecture = Extract<
  CpuArchitecture,
  CpuArchitecture.x86 | CpuArchitecture.ARM | CpuArchitecture.ppc64le | CpuArchitecture.s390x
>;

export const getAllCpuArchitectures = (): SupportedCpuArchitecture[] => [
  CpuArchitecture.x86,
  CpuArchitecture.ARM,
  CpuArchitecture.ppc64le,
  CpuArchitecture.s390x,
];

export const getSupportedCpuArchitectures = (
  canSelectCpuArch: boolean,
  cpuArchitectures: Record<ArchitectureSupportLevelId, SupportLevel> | null,
): SupportedCpuArchitecture[] => {
  const newSupportedCpuArchs: SupportedCpuArchitecture[] = [];
  if (cpuArchitectures) {
    for (const [architectureId, supportLevel] of Object.entries(cpuArchitectures) as unknown as [
      ArchitectureSupportLevelId,
      SupportLevel,
    ][]) {
      if (supportLevel !== 'unsupported') {
        if (
          (architectureId === 'S390X_ARCHITECTURE' || architectureId === 'PPC64LE_ARCHITECTURE') &&
          canSelectCpuArch
        ) {
          newSupportedCpuArchs.push(featureIdToCpuArchitecture[architectureId]);
        } else if (architectureId !== 'MULTIARCH_RELEASE_IMAGE') {
          newSupportedCpuArchs.push(featureIdToCpuArchitecture[architectureId]);
        }
      }
    }
  }
  return newSupportedCpuArchs;
};

export const getDefaultCpuArchitecture = (): SupportedCpuArchitecture => CpuArchitecture.x86;

export const getDisabledReasonForCpuArch = (
  cpuArchLabel: string,
  isMultiArchSupported: boolean,
) => {
  if (!isMultiArchSupported) {
    return `You don't have permissions to use multiple CPU architectures`;
  } else {
    return `${cpuArchLabel} is not supported in this OpenShift version`;
  }
};
