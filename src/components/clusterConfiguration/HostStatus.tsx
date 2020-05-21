import React from 'react';
import { Popover, Button, ButtonVariant } from '@patternfly/react-core';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_200 as okColor,
} from '@patternfly/react-tokens';
import { ExclamationCircleIcon, CheckCircleIcon } from '@patternfly/react-icons';

type HostStatus =
  | 'discovering'
  | 'known'
  | 'disconnected'
  | 'insufficient'
  | 'disabled'
  | 'installing'
  | 'installed'
  | 'error';

const statusTitles = {
  discovering: 'Discovering',
  known: 'Known',
  disconnected: 'Disconnected',
  insufficient: 'Insufficient',
  disabled: 'Disabled',
  installing: 'Installing',
  installed: 'Installed',
  error: 'Error',
};

const getStatusIcon = (status: HostStatus) => {
  if (status === 'insufficient') return <ExclamationCircleIcon color={dangerColor.value} />;
  if (status === 'known') return <CheckCircleIcon color={okColor.value} />;
  return null;
};

type HostStatusProps = {
  status: HostStatus;
  statusInfo?: string;
};

const HostStatus: React.FC<HostStatusProps> = ({ status, statusInfo }) => {
  const title = statusTitles[status] || status;
  const icon = getStatusIcon(status);
  if (statusInfo) {
    return (
      <Popover headerContent={<div>{title}</div>} bodyContent={<div>{statusInfo}</div>}>
        <Button variant={ButtonVariant.link} isInline>
          {icon} {title}
        </Button>
      </Popover>
    );
  }
  return (
    <>
      {icon} {title}
    </>
  );
};

export default HostStatus;
