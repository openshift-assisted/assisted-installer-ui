import React from 'react';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { FileAltIcon } from '@patternfly/react-icons/dist/js/icons/file-alt-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { BanIcon } from '@patternfly/react-icons/dist/js/icons/ban-icon';
import { clusterStatusLabels, UiIcon, WithTestID } from '../../../common';
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
      return <UiIcon size="sm" icon={<BanIcon {...extraProps} />} />;
    case 'insufficient':
    case 'pending-for-input':
    case 'ready':
      return <UiIcon size="sm" icon={<FileAltIcon {...extraProps} />} />;
    case 'error':
      return <UiIcon size="sm" status="danger" icon={<ExclamationCircleIcon {...extraProps} />} />;
    case 'installed':
      return <UiIcon size="sm" icon={<CheckCircleIcon color={okColor.value} {...extraProps} />} />;
    case 'installing-pending-user-action':
      return (
        <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon {...extraProps} />} />
      );

    case 'preparing-for-installation':
    case 'installing':
    case 'finalizing':
    case 'adding-hosts':
      return <UiIcon size="sm" icon={<InProgressIcon {...extraProps} />} />;
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
