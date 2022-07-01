import { CpuArchitecture, OpenshiftVersionOptionType } from '../../common';
import { findVersionItemByVersion } from './useOpenshiftVersions';

const versions: OpenshiftVersionOptionType[] = [
  {
    label: 'Openshift 4.11.0-fc.3',
    value: '4.11',
    version: '4.11.0-fc.3',
    default: true,
    supportLevel: 'beta',
    cpuArchitectures: ['x86_64'] as CpuArchitecture[],
  },
  {
    label: 'Openshift 4.10.4',
    value: '4.10',
    version: '4.10.4',
    default: false,
    supportLevel: 'production',
    cpuArchitectures: ['x86_64'] as CpuArchitecture[],
  },
  {
    label: 'Openshift 4.9.3',
    value: '4.9',
    version: '4.9.3',
    default: false,
    supportLevel: 'production',
    cpuArchitectures: ['x86_64'] as CpuArchitecture[],
  },
  {
    label: 'Openshift 4.1.5',
    value: '4.1',
    version: '4.1.5',
    default: false,
    supportLevel: 'maintenance',
    cpuArchitectures: ['x86_64'] as CpuArchitecture[],
  },
];

const testVersion = (version: string) => {
  const result = findVersionItemByVersion(versions, version);
  const isValid = result?.version === version;
  console.log('version', version, isValid);
  // Run test runner expectations
};

// TODO use with a test runner: using versions 4.11.0-fc.3, 4.9.3 and 4.1.5 (important due to the partial matching)
export default testVersion;
