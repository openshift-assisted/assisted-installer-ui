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
import { ExternalLink, getHumanizedDateTime } from '../ui';

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
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { APPROVE_NODES_IN_CL_LINK } from '../../config';

const getTitleWithProgress = (host: Host, status: HostStatusProps['status']) => {
  const stages = getHostProgressStages(host);
  const stageNumber = getHostProgressStageNumber(host);
  return status.withProgress ? `${status.title} ${stageNumber}/${stages.length}` : status.title;
};

type HostStatusPopoverContentProps = ValidationInfoActionProps & {
  details?: string;
  validationsInfo: ValidationsInfo;
  autoCSR?: boolean;
  additionalPopoverContent?: React.ReactNode;
};

const HostStatusPopoverContent: React.FC<HostStatusPopoverContentProps> = ({
  details,
  autoCSR,
  additionalPopoverContent,
  ...props
}) => {
  const { host } = props;
  const { status, statusInfo } = host;
  const { t } = useTranslation();

  if (['installing-in-progress'].includes(status)) {
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

  if (['added-to-existing-cluster'].includes(status)) {
    return (
      <TextContent>
        <Text>{details}</Text>
        {!autoCSR && (
          <>
            <br />
            {t(
              "ai:To finish adding nodes to the cluster, approve the join request inside OpenShift Console's Nodes section.",
            )}
            <br />
            {t('ai:It may take a few minutes for the join request to appear.')}
            <br />
            {t('ai:If you prefer using the CLI, follow the instructions in')}&nbsp;
            <ExternalLink href={APPROVE_NODES_IN_CL_LINK}>
              {t('ai:How to approve nodes using the CLI')}
            </ExternalLink>
          </>
        )}
        <HostProgress host={host} />
      </TextContent>
    );
  }

  if (
    [
      'preparing-for-installation',
      'preparing-successful',
      'installing',
      'unbinding-pending-user-action',
      'binding',
      'unbinding',
      'reclaiming',
      'reclaiming-rebooting',
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
    <Stack hasGutter>
      {additionalPopoverContent}
      <StackItem>
        {details && (
          <TextContent>
            <Text>{details}</Text>
          </TextContent>
        )}
        <HostValidationGroups {...props} />
      </StackItem>
    </Stack>
  );
};

const HostStatusPopoverFooter: React.FC<{ host: Host }> = ({ host }) => {
  const { progress, statusUpdatedAt } = host;
  const { t } = useTranslation();

  if (host.status === 'added-to-existing-cluster') {
    return (
      <OcpConsoleNodesSectionLink
        id={`host-status-detail-link-to-ocp-nodes-${host.requestedHostname || host.id}`}
      />
    );
  }
  let footerText;
  if (host.status === 'installing-in-progress') {
    if (progress?.stageUpdatedAt && progress.stageUpdatedAt !== progress.stageStartedAt) {
      footerText = t('ai:Step started at {{startedAt}}, updated {{updatedAt}}', {
        startedAt: getHumanizedDateTime(progress.stageStartedAt),
        updatedAt: hdate.relativeTime(progress.stageUpdatedAt),
      });
    } else {
      footerText = t('ai:Step started at {{startedAt}}', {
        startedAt: getHumanizedDateTime(progress?.stageStartedAt || statusUpdatedAt),
      });
    }
  } else if (statusUpdatedAt) {
    footerText = t('ai:Status updated at {{humanizedDataTime}}', {
      humanizedDataTime: getHumanizedDateTime(statusUpdatedAt),
    });
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
    autoCSR?: boolean;
    additionalPopoverContent?: React.ReactNode;
  };

const WithHostStatusPopover: React.FC<WithHostStatusPopoverProps> = (props) => (
  <Popover
    headerContent={<div>{props.title}</div>}
    bodyContent={
      <div style={{ maxHeight: '33vh', overflow: 'auto' }}>
        <HostStatusPopoverContent {...props} />
      </div>
    }
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
  autoCSR,
  additionalPopoverContent,
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
    autoCSR,
    additionalPopoverContent,
  };

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
      {<FlexItem>{icon || <UnknownIcon />}</FlexItem>}

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {!children && !sublabel && !noPopover ? (
          <WithHostStatusPopover {...popoverProps}>{titleWithProgress}</WithHostStatusPopover>
        ) : (
          <FlexItem>{titleWithProgress}</FlexItem>
        )}
        {children && <FlexItem>{children}</FlexItem>}
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
