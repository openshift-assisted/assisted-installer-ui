import React from 'react';
import { Popover, Button, ButtonVariant, Text, TextContent } from '@patternfly/react-core';
import {
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
  InProgressIcon,
  DisconnectedIcon,
  ConnectedIcon,
  BanIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import hdate from 'human-date';
import { Cluster, Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostProgress from './HostProgress';
import { HOST_STATUS_LABELS, HOST_STATUS_DETAILS } from '../../config/constants';
import { getHumanizedDateTime } from '../ui/utils';
import { toSentence } from '../ui/table/utils';
import { getHostProgressStageNumber, getHostProgressStages } from './utils';
import { stringToJSON } from '../../api/utils';
import HostValidationGroups, { ValidationInfoActionProps } from './HostValidationGroups';

const getStatusIcon = (status: Host['status']): React.ReactElement => {
  switch (status) {
    case 'discovering':
      return <ConnectedIcon />;
    case 'pending-for-input':
      return <PendingIcon />;
    case 'disconnected':
      return <DisconnectedIcon />;
    case 'cancelled':
    case 'disabled':
      return <BanIcon />;
    case 'error':
      return <ExclamationCircleIcon color={dangerColor.value} />;
    case 'resetting-pending-user-action':
      return <WarningTriangleIcon color={warningColor.value} />;
    case 'insufficient':
    case 'installing-pending-user-action':
      return <WarningTriangleIcon color={warningColor.value} />;
    case 'known':
    case 'installed':
      return <CheckCircleIcon color={okColor.value} />;
    case 'preparing-for-installation':
    case 'installing':
    case 'installing-in-progress':
    case 'resetting':
    case 'added-to-existing-cluster':
      return <InProgressIcon />;
  }
};

const getPopoverContent = (props: ValidationInfoActionProps) => {
  const { host } = props;
  const { status, statusInfo } = host;
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const statusDetails = HOST_STATUS_DETAILS[status];

  if (['installing', 'installing-in-progress'].includes(status)) {
    return (
      <TextContent>
        <HostProgress host={host} />
      </TextContent>
    );
  }
  if (['error', 'cancelled', 'installing-pending-user-action'].includes(status)) {
    return (
      <TextContent>
        <Text>
          {statusDetails && (
            <>
              {statusDetails} <br />
            </>
          )}
          {toSentence(statusInfo)}
        </Text>
        <HostProgress host={host} />
      </TextContent>
    );
  }
  return (
    <>
      <TextContent>
        <Text>
          {statusDetails && (
            <>
              {statusDetails}
              <br />
            </>
          )}
          {toSentence(statusInfo)}
        </Text>
      </TextContent>
      <HostValidationGroups validationsInfo={validationsInfo} {...props} />
    </>
  );
};

type HostStatusProps = {
  host: Host;
  cluster: Cluster;
};

const getFooterText = (host: Host): string => {
  const { progress, statusUpdatedAt } = host;

  let footerText;
  if (host.status === 'installing-in-progress') {
    if (progress?.stageUpdatedAt && progress.stageUpdatedAt != progress.stageStartedAt) {
      footerText = `Step started at ${getHumanizedDateTime(
        progress.stageStartedAt,
      )}, updated ${hdate.relativeTime(progress.stageUpdatedAt)}`;
    } else {
      footerText = `Step started at ${getHumanizedDateTime(
        progress?.stageStartedAt || statusUpdatedAt,
      )}`;
    }
  } else {
    footerText = `Status updated at ${getHumanizedDateTime(statusUpdatedAt)}`;
  }

  return footerText;
};

const HostStatus: React.FC<HostStatusProps> = ({ host, cluster }) => {
  const [keepOnOutsideClick, onValidationActionToggle] = React.useState(false);
  const { status } = host;
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status) || null;
  const hostProgressStages = getHostProgressStages(host);

  return (
    <>
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={getPopoverContent({ host, cluster, onValidationActionToggle })}
        footerContent={<small>{getFooterText(host)}</small>}
        minWidth="30rem"
        maxWidth="50rem"
        hideOnOutsideClick={!keepOnOutsideClick}
        zIndex={keepOnOutsideClick ? 300 : undefined}
      >
        <Button variant={ButtonVariant.link} isInline>
          {icon} {title}{' '}
          {['installing', 'installing-in-progress', 'error', 'cancelled'].includes(status) && (
            <>
              {getHostProgressStageNumber(host)}/{hostProgressStages.length}
            </>
          )}
        </Button>
      </Popover>
      {['installing-pending-user-action', 'disconnected'].includes(status) && (
        <div className="hosts-table-sublabel">Action required</div>
      )}
    </>
  );
};

export default HostStatus;
