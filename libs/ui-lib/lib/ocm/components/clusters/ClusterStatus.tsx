import React from 'react';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/js/global_success_color_100';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { FileAltIcon } from '@patternfly/react-icons/dist/js/icons/file-alt-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { BanIcon } from '@patternfly/react-icons/dist/js/icons/ban-icon';
import { clusterStatusLabels, WithTestID } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

type ClusterStatusProps = {
  status: Cluster['status'];
  className?: string;
};

type ClusterStatusIconProps = {
  status: Cluster['status'];
  className?: string;
};

export const ClusterStatusIcon: React.FC<ClusterStatusIconProps> = ({ status, ...extraProps }) => {
  switch (status) {
    case 'cancelled':
      return <BanIcon size={'sm'} {...extraProps} />;
    case 'insufficient':
    case 'pending-for-input':
    case 'ready':
      return <FileAltIcon size={'sm'} {...extraProps} />;
    case 'error':
      return <ExclamationCircleIcon color={dangerColor.value} size={'sm'} {...extraProps} />;
    case 'installed':
      return <CheckCircleIcon color={okColor.value} size={'sm'} {...extraProps} />;
    case 'installing-pending-user-action':
      return <ExclamationTriangleIcon color={warningColor.value} size={'sm'} {...extraProps} />;
    case 'preparing-for-installation':
    case 'installing':
    case 'finalizing':
    case 'adding-hosts':
      return <InProgressIcon size={'sm'} {...extraProps} />;
    default:
      return <></>;
  }
};

export const getClusterStatusText = (t: TFunction, status: Cluster['status']) => {
  return clusterStatusLabels(t)[status] || status;
};

const ClusterStatus: React.FC<ClusterStatusProps & WithTestID> = ({
  status,
  testId,
  className,
}) => {
  const { t } = useTranslation();
  const title = getClusterStatusText(t, status);

  return (
    <>
      <ClusterStatusIcon status={status} data-testid={testId} className={className} /> {title}
    </>
  );
};

export default ClusterStatus;
