import {
  ClusterCreateParams,
  OpenshiftVersion,
} from '@openshift-assisted/types/assisted-installer-service';
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
