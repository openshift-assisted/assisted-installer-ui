import React from 'react';
import { Cluster, Disk, Host, HostUpdateParams } from '../../api';
import { ValidationsInfo } from '../../types/hosts';
import { HostsNotShowingLinkProps } from '../clusterConfiguration';
import { OnDiskRoleType } from './DiskRole';
import { AdditionNtpSourcePropsType, UpdateDay2ApiVipPropsType } from './HostValidationGroups';

export type ClusterHostsTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

export type EditHostFormValues = {
  hostId: string; // identifier, uuid
  hostname: string; // requested change
};

export type ActionCheck = [/* enabled */ boolean, /* reason */ string | undefined];

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
  onDiskRole?: OnDiskRoleType;
  canEditHost?: (host: Host) => boolean | ActionCheck;
  canEnable?: (host: Host) => boolean;
  canDisable?: (host: Host) => boolean;
  canReset?: (host: Host) => boolean;
  canDownloadHostLogs?: (host: Host) => boolean;
  canDelete?: (host: Host) => boolean | ActionCheck;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRole?: (host: Host, role: HostUpdateParams['hostRole']) => Promise<any>;
  canEditRole?: (host: Host) => boolean;
  onEditBMH?: (host: Host) => void;
  canEditBMH?: (host: Host) => ActionCheck;
  onSelect?: (host: Host, selected: boolean) => void;
  canEditHostname?: () => boolean;
  canUnbindHost?: (host: Host) => ActionCheck;
  onUnbindHost?: (host: Host) => void;
  onExcludedODF?: (
    hostId: Host['id'],
    nodeLabels: HostUpdateParams['nodeLabels'],
  ) => Promise<unknown>;
  updateSkipFormatting?: (
    shouldFormatDisk: boolean,
    hostId: Host['id'],
    diskId: Disk['id'],
  ) => Promise<unknown>;
};

export type HostNetworkingStatusComponentProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
};

export type HostStatusDef = {
  key: string;
  title: string;
  category: 'Installation related' | 'Discovery related' | 'Bare Metal Host related';
  icon?: React.ReactNode;
  sublabel?: string;
  details?: string;
  noPopover?: boolean;
  withProgress?: boolean;
};

export type HostStatus<S extends string> = {
  [key in S]: HostStatusDef;
};

export type HostStatusProps = AdditionNtpSourcePropsType &
  UpdateDay2ApiVipPropsType & {
    host: Host;
    validationsInfo: ValidationsInfo;
    onEditHostname?: () => void;
    status: HostStatusDef;
    zIndex?: number;
    autoCSR?: boolean;
    additionalPopoverContent?: React.ReactNode;
  };
