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
export enum NewCpuArchitecture {
  ARM64_ARCHITECTURE = 'arm64',
  MULTIARCH_RELEASE_IMAGE = 'multi',
  PPC64LE_ARCHITECTURE = 'ppc64le',
  S390X_ARCHITECTURE = 's390x',
  X86_64_ARCHITECTURE = 'x86_64',
}

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
  cpuArchitectures?: SupportLevels,
  canSelectCpuArch?: boolean,
): SupportedCpuArchitecture[] => {
  if (cpuArchitectures !== undefined && cpuArchitectures.architectures !== undefined) {
    const newSupportedCpuArchs: SupportedCpuArchitecture[] = [];
    const isMultiImage =
      cpuArchitectures.architectures['MULTIARCH_RELEASE_IMAGE'] !== 'unsupported';

    const supportedCpuArchs: string[] = Object.keys(cpuArchitectures.architectures).filter(
      (key: string) => cpuArchitectures.architectures[key] === 'supported',
    );
    if (isMultiImage) {
      if (canSelectCpuArch) {
        supportedCpuArchs.map((arch) => {
          newSupportedCpuArchs.push(NewCpuArchitecture[arch] as SupportedCpuArchitecture);
        });
        return newSupportedCpuArchs;
      } else {
        return [CpuArchitecture.x86];
      }
    } else {
      return [CpuArchitecture.x86, CpuArchitecture.ARM];
    }
  } else {
    return [CpuArchitecture.x86, CpuArchitecture.ARM];
  }
};

export const getDefaultCpuArchitecture = (): SupportedCpuArchitecture => CpuArchitecture.x86;
