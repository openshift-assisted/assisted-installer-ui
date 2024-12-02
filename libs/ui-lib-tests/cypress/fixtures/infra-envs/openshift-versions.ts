interface Version {
  cpu_architectures: string[];
  display_name: string;
  support_level: string;
  default?: boolean;
}

export const x86 = 'x86_64';
export const arm64 = 'arm64';
export const s390x = 's390x';
export const ppc64le = 'ppc64le';

const versions: Record<string, Version> = {
  '4.9': {
    cpu_architectures: [x86],
    display_name: '4.9.59',
    support_level: 'end-of-life',
  },
  '4.10': {
    cpu_architectures: [x86, arm64],
    display_name: '4.10.67',
    support_level: 'production',
  },
  '4.11': {
    cpu_architectures: [x86, arm64],
    default: true,
    display_name: '4.11.38',
    support_level: 'production',
  },
  '4.12': {
    cpu_architectures: [x86, arm64],
    display_name: '4.12.14',
    support_level: 'production',
  },
  '4.13': {
    cpu_architectures: [x86, arm64],
    display_name: '4.13.0-rc.6',
    support_level: 'beta',
  },
  '4.14': {
    cpu_architectures: [x86, arm64, s390x, ppc64le],
    display_name: '4.14.16',
    support_level: 'production',
  },
  '4.15': {
    cpu_architectures: [x86, arm64, s390x, ppc64le],
    display_name: 'OpenShift 4.15.2',
    support_level: 'production',
  },
};

expect(
  Object.entries(versions).filter(([_, versionItem]) => versionItem.default === true),
).to.have.length(1);

// The values must be sorted with most recent version being first
const getExpectedVersionIds = () => Object.keys(versions).reverse();
const getVersionWithNoArmSupport = (): string => '4.9';
const getVersionWithArmSupport = (): string => '4.10';
const getDefaultOpenShiftVersion = (): string => '4.11';

export {
  versions as openShiftVersions,
  getExpectedVersionIds,
  getVersionWithNoArmSupport,
  getVersionWithArmSupport,
  getDefaultOpenShiftVersion,
};
