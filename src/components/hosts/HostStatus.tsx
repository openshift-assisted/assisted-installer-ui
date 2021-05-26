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
  ExclamationTriangleIcon,
  InProgressIcon,
  DisconnectedIcon,
  ConnectedIcon,
  BanIcon,
  PendingIcon,
  AddCircleOIcon,
} from '@patternfly/react-icons';
import hdate from 'human-date';
import { Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostProgress from './HostProgress';
import { HOST_STATUS_LABELS, HOST_STATUS_DETAILS } from '../../config/constants';
import { getHumanizedDateTime } from '../ui/utils';
import { getHostProgressStageNumber, getHostProgressStages } from './utils';
import HostValidationGroups, { ValidationInfoActionProps } from './HostValidationGroups';
import OcpConsoleNodesSectionLink from './OcpConsoleNodesSectionLink';
import { toSentence } from '../ui/table/utils';

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
      return <ExclamationTriangleIcon color={warningColor.value} />;
    case 'insufficient':
    case 'installing-pending-user-action':
      return <ExclamationTriangleIcon color={warningColor.value} />;
    case 'known':
    case 'installed':
      return <CheckCircleIcon color={okColor.value} />;
    case 'preparing-for-installation':
    case 'preparing-successful':
    case 'installing':
    case 'installing-in-progress':
    case 'resetting':
      return <InProgressIcon />;
    case 'added-to-existing-cluster':
      return <AddCircleOIcon />;
  }
};

type HostStatusPopoverContentProps = ValidationInfoActionProps & {
  validationsInfo: ValidationsInfo;
};

const HostStatusPopoverContent: React.FC<HostStatusPopoverContentProps> = (props) => {
  const { host } = props;
  const { status, statusInfo } = host;
  const statusDetails = HOST_STATUS_DETAILS[status];

  if (status === 'added-to-existing-cluster') {
    return (
      <TextContent>
        <Text>
          This host was successfully installed.
          <br />
          To finish adding it to the cluster, approve its request to join in the Nodes section of
          the OpenShift console. It might take a few minutes till the node request gets available.
        </Text>
      </TextContent>
    );
  }

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
          {statusDetails}
          <br />
          {toSentence(statusInfo)}
        </Text>
        <HostProgress host={host} />
      </TextContent>
    );
  }

  if (['installed'].includes(status)) {
    return (
      <TextContent>
        <Text>{statusDetails}</Text>
        <HostProgress host={host} />
      </TextContent>
    );
  }

  return (
    <>
      {statusDetails && (
        <TextContent>
          <Text>{statusDetails}</Text>
        </TextContent>
      )}
      <HostValidationGroups {...props} />
    </>
  );
};

type HostStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
  statusOverride?: Host['status'];
  sublabel?: string;
};

const HostStatusPopoverFooter: React.FC<{ host: Host }> = ({ host }) => {
  const { progress, statusUpdatedAt } = host;

  if (host.status === 'added-to-existing-cluster') {
    return (
      <OcpConsoleNodesSectionLink
        id={`host-status-detail-link-to-ocp-nodes-${host.requestedHostname || host.id}`}
      />
    );
  }

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

  return <small>{footerText}</small>;
};

const HostStatus: React.FC<HostStatusProps> = ({
  host,
  validationsInfo,
  statusOverride,
  sublabel,
  onEditHostname,
}) => {
  const [keepOnOutsideClick, onValidationActionToggle] = React.useState(false);
  const status = statusOverride || host.status;
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status) || null;
  const hostProgressStages = getHostProgressStages(host);

  const toggleHostname = React.useCallback(() => {
    onValidationActionToggle(!keepOnOutsideClick);
    onEditHostname?.();
  }, [keepOnOutsideClick, onEditHostname]);

  sublabel =
    sublabel ||
    (['installing-pending-user-action', 'disconnected'].includes(status) && 'Action required') ||
    (status === 'added-to-existing-cluster' && 'Finish in console') ||
    undefined;

  return (
    <>
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={
          <HostStatusPopoverContent
            host={host}
            validationsInfo={validationsInfo}
            onEditHostname={toggleHostname}
          />
        }
        footerContent={<HostStatusPopoverFooter host={host} />}
        minWidth="30rem"
        maxWidth="50rem"
        hideOnOutsideClick={!keepOnOutsideClick}
        zIndex={300}
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
      {sublabel && <div className="hosts-table-sublabel">{sublabel}</div>}
    </>
  );
};

export default HostStatus;
