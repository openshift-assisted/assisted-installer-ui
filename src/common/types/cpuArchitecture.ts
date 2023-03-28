import { ArchitectureSupportLevelId, SupportLevels } from '../api';

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
  x86 = 'x86_64',
  ARM = 'arm64',
  MULTI = 'multi',
  ppc64le = 'ppc64le',
  s390x = 's390x',
}

export const featureIdToCpuArchitecture: Record<ArchitectureSupportLevelId, CpuArchitecture> = {
  ARM64_ARCHITECTURE: CpuArchitecture.ARM,
  PPC64LE_ARCHITECTURE: CpuArchitecture.ppc64le,
  S390X_ARCHITECTURE: CpuArchitecture.s390x,
  X86_64_ARCHITECTURE: CpuArchitecture.x86,
  MULTIARCH_RELEASE_IMAGE: CpuArchitecture.MULTI,
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

export const getSupportLevelsForCpuArchitecture = (
  canSelectCpuArch: boolean,
  cpuArchitectures: SupportLevels | null,
): CpuArchitecture[] => {
  const newSupportedCpuArchs: CpuArchitecture[] = [];
  if (cpuArchitectures) {
    for (const [architectureId, supportLevel] of Object.entries(cpuArchitectures.architectures)) {
      if (supportLevel !== 'unsupported' && architectureId !== 'MULTIARCH_RELEASE_IMAGE') {
        if (architectureId === 'S390X_ARCHITECTURE' || architectureId === 'PPC64LE_ARCHITECTURE') {
          if (canSelectCpuArch) {
            newSupportedCpuArchs.push(featureIdToCpuArchitecture[architectureId]);
          }
        } else {
          newSupportedCpuArchs.push(featureIdToCpuArchitecture[architectureId] as CpuArchitecture);
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
