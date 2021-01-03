import React from 'react';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as okColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  FileAltIcon,
  CheckCircleIcon,
  InProgressIcon,
  BanIcon,
  IconSize,
} from '@patternfly/react-icons';
import { Cluster, ClusterStatusEnum } from '../../api/types';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';

type ClusterStatusProps = {
  cluster: Cluster;
};

const iconProps = {
  // className: 'clusterStatus',
  size: IconSize.sm,
};

type ClusterStatusIconProps = {
  status: ClusterStatusEnum;
};

export const ClusterStatusIcon: React.FC<ClusterStatusIconProps> = ({ status }) => {
  switch (status) {
    case ClusterStatusEnum.CANCELLED:
      return <BanIcon {...iconProps} />;
    case ClusterStatusEnum.INSUFFICIENT:
    case ClusterStatusEnum.PENDING_FOR_INPUT:
      return <FileAltIcon {...iconProps} />;
    case ClusterStatusEnum.ERROR:
      return <ExclamationCircleIcon color={dangerColor.value} {...iconProps} />;
    case ClusterStatusEnum.READY:
    case ClusterStatusEnum.INSTALLED:
      return <CheckCircleIcon color={okColor.value} {...iconProps} />;
    case ClusterStatusEnum.INSTALLING_PENDING_USER_INPUT:
      return <ExclamationTriangleIcon color={warningColor.value} {...iconProps} />;
    case ClusterStatusEnum.PREPARING_FOR_INSTALLATION:
    case ClusterStatusEnum.INSTALLING:
    case ClusterStatusEnum.FINALIZING:
    case ClusterStatusEnum.ADDING_HOSTS:
      return <InProgressIcon {...iconProps} />;
    default:
      return <></>;
  }
};

export const getClusterStatusText = (cluster: Cluster) =>
  CLUSTER_STATUS_LABELS[cluster.status] || cluster.status;

const ClusterStatus: React.FC<ClusterStatusProps> = ({ cluster }) => {
  const { status } = cluster;
  const title = getClusterStatusText(cluster);

  return (
    <div>
      <ClusterStatusIcon status={status} /> {title}
    </div>
  );
};

export default ClusterStatus;
