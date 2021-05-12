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
import { Cluster } from '../../api/types';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';

type ClusterStatusProps = {
  status: Cluster['status'];
};

type ClusterStatusIconProps = {
  status: Cluster['status'];
};

export const ClusterStatusIcon: React.FC<ClusterStatusIconProps> = ({ status, ...extraProps }) => {
  const iconProps = {
    size: IconSize.sm,
    ...extraProps,
  };

  switch (status) {
    case 'cancelled':
      return <BanIcon {...iconProps} />;
    case 'insufficient':
    case 'pending-for-input':
    case 'ready':
      return <FileAltIcon {...iconProps} />;
    case 'error':
      return <ExclamationCircleIcon color={dangerColor.value} {...iconProps} />;
    case 'installed':
      return <CheckCircleIcon color={okColor.value} {...iconProps} />;
    case 'installing-pending-user-action':
      return <ExclamationTriangleIcon color={warningColor.value} {...iconProps} />;
    case 'preparing-for-installation':
    case 'installing':
    case 'finalizing':
    case 'adding-hosts':
      return <InProgressIcon {...iconProps} />;
    default:
      return <></>;
  }
};

export const getClusterStatusText = (status: Cluster['status']) =>
  CLUSTER_STATUS_LABELS[status] || status;

const ClusterStatus: React.FC<ClusterStatusProps & WithTestID> = ({ status, testId }) => {
  const title = getClusterStatusText(status);

  return (
    <>
      <ClusterStatusIcon status={status} data-testid={testId} /> {title}
    </>
  );
};

export default ClusterStatus;
