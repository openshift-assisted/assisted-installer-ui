import { OcmClusterExtraInfo, OcmClusterType } from '../AddHosts/types';

export type HostsClusterDetailTabProps = {
  cluster: OcmClusterType;
  extraInfo: OcmClusterExtraInfo;
  isVisible: boolean;
};
