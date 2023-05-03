/* eslint-disable @typescript-eslint/naming-convention */
export const x86 = 'x86_64';
export const arm64 = 'arm64';

const versions = {
  '4.8': {
    cpu_architectures: [x86],
    display_name: '4.8.57',
    support_level: 'production',
  },
  '4.9': {
    cpu_architectures: [x86],
    display_name: '4.9.59',
    support_level: 'production',
  },
  '4.10': {
    cpu_architectures: [x86, arm64],
    default: true,
    display_name: '4.10.57',
    support_level: 'production',
  },
  '4.11': {
    cpu_architectures: [x86, arm64],
    default: true,
    display_name: '4.11.38',
    support_level: 'production',
  },
  '4.11.13-multi': {
    cpu_architectures: [x86, arm64],
    display_name: '4.11.13-multi',
    support_level: 'production',
  },
  '4.12': { cpu_architectures: [x86, arm64], display_name: '4.12.14', support_level: 'production' },
  '4.13': { cpu_architectures: [x86, arm64], display_name: '4.13.0-rc.6', support_level: 'beta' },
};

// The values must be sorted with most recent version being first
const getExpectedVersionIds = () => [
  'OpenShift 4.13.0-rc.6 - Developer preview release',
  'OpenShift 4.12.14',
  'OpenShift 4.11.38',
  'OpenShift 4.11.13-multi',
  'OpenShift 4.10.57',
  'OpenShift 4.9.59',
  'OpenShift 4.8.57',
];
const getVersionWithNoArmSupport = (): string => '4.9';
const getVersionWithArmSupport = (): string => '4.10';
const getDefaultOpenShiftVersion = (): string => '4.11';

export {
  getExpectedVersionIds,
  getVersionWithNoArmSupport,
  getVersionWithArmSupport,
  getDefaultOpenShiftVersion,
};

export default versions;
