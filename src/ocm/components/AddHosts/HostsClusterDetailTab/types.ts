import { OcmClusterType } from '../types';

export type OpenModalType = (modalName: string, cluster?: OcmClusterType) => void;

export type HostsClusterDetailTabProps = {
  cluster?: OcmClusterType;
  isVisible: boolean;
  openModal?: OpenModalType;
};
