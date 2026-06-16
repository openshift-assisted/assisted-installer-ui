import { FeatureListType } from '../../../common';
import { OcmClusterType } from '../../components';

export type HostsClusterDetailTabProps = {
  cluster: OcmClusterType;
  isVisible: boolean;
  allEnabledFeatures: FeatureListType;
};

export interface AddHostsTabState {
  showTab: boolean;
  isDisabled: boolean;
  tabTooltip: string;
}
