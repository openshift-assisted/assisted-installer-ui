import React, { PropsWithChildren } from 'react';
import {
  Popover,
  Button,
  Text,
  TextContent,
  FlexItem,
  Flex,
  ButtonProps,
  Stack,
  StackItem,
} from '@patternfly/react-core';
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
  UnknownIcon,
  LinkIcon,
} from '@patternfly/react-icons';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import hdate from 'human-date';

import { Host } from '../../api';
import { ValidationsInfo } from '../../types/hosts';
import { HOST_STATUS_DETAILS, HOST_STATUS_LABELS } from '../../config';
import { getHumanizedDateTime } from '../ui';

import HostProgress from './HostProgress';
import { getHostProgressStageNumber, getHostProgressStages } from './utils';
import {
  AdditionNtpSourcePropsType,
  HostValidationGroups,
  ValidationInfoActionProps,
} from './HostValidationGroups';
import OcpConsoleNodesSectionLink from './OcpConsoleNodesSectionLink';
import { toSentence } from '../ui/table/utils';
import { RenderIf } from '../ui';
import { HostStatusProps } from './types';
import { UpdateDay2ApiVipPropsType } from './HostValidationGroups';

export const getStatusIcon = (status: Host['status'] | 'discovered') => {
  let icon = null;
  switch (status) {
    case 'discovered':
    case 'discovering':
    case 'discovering-unbound':
      icon = <ConnectedIcon />;
      break;
    case 'pending-for-input':
      icon = <PendingIcon />;
      break;
    case 'disconnected':
    case 'disconnected-unbound':
      icon = <DisconnectedIcon />;
      break;
    case 'cancelled':
    case 'disabled':
    case 'disabled-unbound':
      icon = <BanIcon />;
      break;
    case 'error':
      icon = <ExclamationCircleIcon color={dangerColor.value} />;
      break;
    case 'resetting-pending-user-action':
    case 'insufficient':
    case 'insufficient-unbound':
    case 'installing-pending-user-action':
      icon = <ExclamationTriangleIcon color={warningColor.value} />;
      break;
    case 'known':
    case 'known-unbound':
    case 'installed':
      icon = <CheckCircleIcon color={okColor.value} />;
      break;
    case 'preparing-for-installation':
    case 'preparing-successful':
    case 'installing':
    case 'installing-in-progress':
    case 'resetting':
    case 'unbinding':
    case 'unbinding-pending-user-action':
      icon = <InProgressIcon />;
      break;
    case 'added-to-existing-cluster':
      icon = <AddCircleOIcon />;
      break;
    case 'binding':
      icon = <LinkIcon />;
      break;
    default:
      icon = <UnknownIcon />;
  }

  return icon;
};

const withProgress = (
  title: string,
  currentStage: number,
  totalStages: number,
  status: HostStatusProps['statusOverride'] | Host['status'],
) => {
  const shouldAppendProgress = [
    'installing',
    'installing-in-progress',
    'error',
    'cancelled',
  ].includes(status || '');
  return shouldAppendProgress ? `${title} ${currentStage}/${totalStages}` : title;
};

type HostStatusPopoverContentProps = ValidationInfoActionProps & {
  statusOverride?: Host['status'] | 'discovered';
  validationsInfo: ValidationsInfo;
};

const HostStatusPopoverContent: React.FC<HostStatusPopoverContentProps> = ({ ...props }) => {
  const { host, statusOverride } = props;
  const { status, statusInfo } = host;
  const statusDetails = HOST_STATUS_DETAILS[statusOverride || status];

  if (status === 'added-to-existing-cluster') {
    return (
      <TextContent>
        <Text>
          This host was successfully installed.
          <br />
          To finish adding it to the cluster, approve its join request inside OpenShift Console's
          Nodes section. Note that it may take a few minutes for the join request to appear.
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

  if (['unbinding-pending-user-action'].includes(status)) {
    // No additional error messages shown
    return (
      <TextContent>
        <Text>{statusDetails}</Text>
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
  } else if (statusUpdatedAt) {
    footerText = `Status updated at ${getHumanizedDateTime(statusUpdatedAt)}`;
  }

  return <>{!!footerText && <small>{footerText}</small>}</>;
};

const WithHostStatusPopover = (
  props: AdditionNtpSourcePropsType &
    UpdateDay2ApiVipPropsType &
    PropsWithChildren<{
      hideOnOutsideClick: PopoverProps['hideOnOutsideClick'];
      host: Host;
      onEditHostname: HostStatusPopoverContentProps['onEditHostname'];
      title: string;
      validationsInfo: ValidationsInfo;
      isSmall?: ButtonProps['isSmall'];
      statusOverride: HostStatusProps['statusOverride'];
    }>,
) => (
  <Popover
    headerContent={<div>{props.title}</div>}
    bodyContent={<HostStatusPopoverContent {...props} />}
    footerContent={<HostStatusPopoverFooter host={props.host} />}
    minWidth="30rem"
    maxWidth="50rem"
    hideOnOutsideClick={props.hideOnOutsideClick}
    zIndex={300}
  >
    <Button variant={'link'} isInline isSmall={props.isSmall}>
      {props.children}
    </Button>
  </Popover>
);

const HostStatus: React.FC<HostStatusProps> = ({
  host,
  validationsInfo,
  statusOverride,
  sublabel,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  UpdateDay2ApiVipDialogToggleComponent,
  children,
}) => {
  const [keepOnOutsideClick, onValidationActionToggle] = React.useState(false);
  const status = statusOverride || host.status || '';
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status);
  const stages = getHostProgressStages(host);
  const stageNumber = getHostProgressStageNumber(host);

  const toggleHostname = React.useCallback(() => {
    onValidationActionToggle(!keepOnOutsideClick);
    onEditHostname?.();
  }, [keepOnOutsideClick, onEditHostname]);

  sublabel =
    sublabel ||
    (['installing-pending-user-action', 'disconnected', 'unbinding-pending-user-action'].includes(
      status,
    ) &&
      'Action required') ||
    (status === 'added-to-existing-cluster' && 'Finish in console') ||
    undefined;

  const titleWithProgress = withProgress(title, stageNumber, stages.length, status);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
      {icon && <FlexItem>{icon}</FlexItem>}

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {!sublabel && status !== 'discovered' ? (
          <WithHostStatusPopover
            hideOnOutsideClick={!keepOnOutsideClick}
            host={host}
            onEditHostname={toggleHostname}
            AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
            title={title}
            validationsInfo={validationsInfo}
            statusOverride={status}
            UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
          >
            {titleWithProgress}
          </WithHostStatusPopover>
        ) : (
          <FlexItem>
            <Stack>
              <StackItem>{titleWithProgress}</StackItem>
              {children && <StackItem>{children}</StackItem>}
            </Stack>
          </FlexItem>
        )}
        <RenderIf condition={Boolean(sublabel)}>
          <FlexItem
            className={'pf-u-font-size-xs'}
            style={{ marginTop: 'calc(-1 * var(--pf-l-flex--spacer--xs))' }}
          >
            <WithHostStatusPopover
              hideOnOutsideClick={!keepOnOutsideClick}
              host={host}
              onEditHostname={toggleHostname}
              AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
              title={title}
              validationsInfo={validationsInfo}
              statusOverride={status}
              UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
            >
              {sublabel}
            </WithHostStatusPopover>
          </FlexItem>
        </RenderIf>
      </Flex>
    </Flex>
  );
};

export default HostStatus;
