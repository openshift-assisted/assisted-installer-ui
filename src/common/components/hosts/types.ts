import { Cluster, Host } from '../../api';
import { ValidationsInfo } from '../../types/hosts';
import { HostsNotShowingLinkProps } from '../clusterConfiguration';
import { onDiskRoleType } from './DiskRole';
import { AdditionNtpSourcePropsType } from './HostValidationGroups';

export type ClusterHostsTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

export type EditHostFormValues = {
  hostId: string; // identifier, uuid
  hostname: string; // requested change
};

export type HostsTableActions = {
  onDeleteHost?: (host: Host) => void;
  onHostEnable?: (host: Host) => void;
  onInstallHost?: (host: Host) => void;
  onHostDisable?: (host: Host) => void;
  onHostReset?: (host: Host) => void;
  onViewHostEvents?: (host: Host) => void;
  onEditHost?: (host: Host) => void;
  onDownloadHostLogs?: (host: Host) => void;
  canInstallHost?: (host: Host) => boolean;
  canEditDisks?: (host: Host) => boolean;
  onDiskRole?: onDiskRoleType;
  canEditHost?: (host: Host) => boolean;
  canEnable?: (host: Host) => boolean;
  canDisable?: (host: Host) => boolean;
  canReset?: (host: Host) => boolean;
  canDownloadHostLogs?: (host: Host) => boolean;
  canDelete?: (host: Host) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole?: (host: Host, role?: string) => Promise<any>;
  canEditRole?: (host: Host) => boolean;
  onEditBMH?: (host: Host) => void;
  canEditBMH?: (host: Host) => boolean;
  onSelect?: (host: Host, selected: boolean) => void;
};

export type HostNetworkingStatusComponentProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
};

export type HostStatusProps = AdditionNtpSourcePropsType & {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
  statusOverride?: Host['status'] | 'Discovered' | 'Bound';
  sublabel?: string;
};
