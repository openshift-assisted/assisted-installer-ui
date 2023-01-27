/* eslint-disable @typescript-eslint/naming-convention */
const x86 = 'x86_64';
const arm64 = 'arm64';

const versions = {
  4.9: {
    cpu_architectures: [x86],
    display_name: '4.9.29',
    support_level: 'production',
  },
  '4.11': {
    'cpu_architectures': [x86, arm64],
    'default': true,
    'display_name': '4.11.6',
    'support_level': 'production',
  },
  '4.11.0-multi': {
    'cpu_architectures': [x86, arm64],
    'display_name': '4.11.0-multi',
    'support_level': 'production',
  },
  '4.12': { 'cpu_architectures': [x86, arm64], 'display_name': '4.12.0-ec.3', 'support_level': 'beta' },
  '4.10': {
    'cpu_architectures': [x86, arm64],
    default: true,
    display_name: '4.10.11',
    support_level: 'production',
  },
};

// The values must be sorted with most recent version being first
const getExpectedVersionIds = () => ['4.12', '4.11', '4.11.0-multi', '4.10', '4.9'];
const getVersionWithNoArmSupport = (): string => '4.9';
const getVersionWithArmSupport = (): string => '4.10';
const getDefaultOpenShiftVersion = (): string => '4.11';

export {
  getExpectedVersionIds,
  getVersionWithNoArmSupport,
  getVersionWithArmSupport,
  getDefaultOpenShiftVersion,
}

export default versions;
