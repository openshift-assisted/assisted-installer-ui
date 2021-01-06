import { ClusterCreateParams, OpenshiftVersion } from '../api';

export type OpenshiftVersionOptionType = {
  label: string;

  // effectively OpenshiftVersions key (means :string)
  value: ClusterCreateParams['openshiftVersion'];

  supportLevel: OpenshiftVersion['supportLevel'];
};
