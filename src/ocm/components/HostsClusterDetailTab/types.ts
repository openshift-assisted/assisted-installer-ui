import { FeatureListType } from '../../../common';
import { OcmClusterType } from '../AddHosts/types';

export type HostsClusterDetailTabProps = {
  cluster: OcmClusterType;
  isVisible: boolean;
  allEnabledFeatures: FeatureListType;
};
