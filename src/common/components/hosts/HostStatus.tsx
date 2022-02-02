import React from 'react';
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
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import hdate from 'human-date';

import { Host } from '../../api';
import { ValidationsInfo } from '../../types/hosts';
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
import { HostStatusProps } from './types';
import { UpdateDay2ApiVipPropsType } from './HostValidationGroups';
import { UnknownIcon } from '@patternfly/react-icons';

const getTitleWithProgress = (host: Host, status: HostStatusProps['status']) => {
  const stages = getHostProgressStages(host);
  const stageNumber = getHostProgressStageNumber(host);
  return status.withProgress ? `${status.title} ${stageNumber}/${stages.length}` : status.title;
};

type HostStatusPopoverContentProps = ValidationInfoActionProps & {
  details?: string;
  validationsInfo: ValidationsInfo;
};

const HostStatusPopoverContent: React.FC<HostStatusPopoverContentProps> = ({
  details,
  ...props
}) => {
  const { host } = props;
  const { status, statusInfo } = host;

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
          {details}
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
        <Text>{details}</Text>
        <HostProgress host={host} />
      </TextContent>
    );
  }

  if (
    [
      'preparing-for-installation',
      'preparing-successful',
      'unbinding-pending-user-action',
      'binding',
      'unbinding',
    ].includes(status)
  ) {
    // No additional error messages shown
    return (
      <TextContent>
        <Text>{details}</Text>
      </TextContent>
    );
  }

  return (
    <>
      {details && (
        <TextContent>
          <Text>{details}</Text>
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

type WithHostStatusPopoverProps = AdditionNtpSourcePropsType &
  UpdateDay2ApiVipPropsType & {
    hideOnOutsideClick: PopoverProps['hideOnOutsideClick'];
    host: Host;
    onEditHostname: HostStatusPopoverContentProps['onEditHostname'];
    title: string;
    validationsInfo: ValidationsInfo;
    isSmall?: ButtonProps['isSmall'];
    details?: string;
    zIndex?: number;
  };

const WithHostStatusPopover: React.FC<WithHostStatusPopoverProps> = (props) => (
  <Popover
    headerContent={<div>{props.title}</div>}
    bodyContent={<HostStatusPopoverContent {...props} />}
    footerContent={<HostStatusPopoverFooter host={props.host} />}
    minWidth="30rem"
    maxWidth="50rem"
    hideOnOutsideClick={props.hideOnOutsideClick}
    zIndex={props.zIndex || 300}
  >
    <Button variant={'link'} isInline isSmall={props.isSmall}>
      {props.children}
    </Button>
  </Popover>
);

const HostStatus: React.FC<HostStatusProps> = ({
  host,
  validationsInfo,
  status,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  UpdateDay2ApiVipDialogToggleComponent,
  children,
  zIndex,
}) => {
  const [keepOnOutsideClick, onValidationActionToggle] = React.useState(false);

  const toggleHostname = React.useCallback(() => {
    onValidationActionToggle(!keepOnOutsideClick);
    onEditHostname?.();
  }, [keepOnOutsideClick, onEditHostname]);

  const { title, icon, sublabel, details, noPopover } = status;
  const titleWithProgress = getTitleWithProgress(host, status);

  const popoverProps: WithHostStatusPopoverProps = {
    hideOnOutsideClick: !keepOnOutsideClick,
    host,
    onEditHostname: toggleHostname,
    AdditionalNTPSourcesDialogToggleComponent,
    title,
    validationsInfo,
    details,
    UpdateDay2ApiVipDialogToggleComponent,
    zIndex,
  };

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
      {<FlexItem>{icon || <UnknownIcon />}</FlexItem>}

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {!sublabel && !noPopover ? (
          <WithHostStatusPopover {...popoverProps}>{titleWithProgress}</WithHostStatusPopover>
        ) : (
          <FlexItem>
            <Stack>
              <StackItem>{titleWithProgress}</StackItem>
              {children && <StackItem>{children}</StackItem>}
            </Stack>
          </FlexItem>
        )}
        {sublabel && (
          <FlexItem
            className="pf-u-font-size-xs"
            style={{ marginTop: 'calc(-1 * var(--pf-l-flex--spacer--xs))' }}
          >
            <WithHostStatusPopover {...popoverProps}>{sublabel}</WithHostStatusPopover>
          </FlexItem>
        )}
      </Flex>
    </Flex>
  );
};

export default HostStatus;
