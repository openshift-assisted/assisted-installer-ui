import { OcmClusterType } from '../../components';
import { FeatureListType } from '../../hooks';

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
