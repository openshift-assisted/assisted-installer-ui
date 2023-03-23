import { ClusterCreateParams, OpenshiftVersion } from '../api/types';
import { CpuArchitecture } from './cpuArchitecture';

export type OpenshiftVersionOptionType = {
  label: string;
  // effectively OpenshiftVersions key (means :string)
  value: ClusterCreateParams['openshiftVersion'];
  version: string;
  default: boolean;
  supportLevel: OpenshiftVersion['supportLevel'];
  cpuArchitectures?: CpuArchitecture[];
};
