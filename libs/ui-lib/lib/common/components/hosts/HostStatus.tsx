import React from 'react';
import { Popover, Button, Content, FlexItem, Flex, Stack, StackItem } from '@patternfly/react-core';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import hdate from 'human-date';

import { Host, HostProgressInfo } from '@openshift-assisted/types/assisted-installer-service';
import { ValidationsInfo } from '../../types/hosts';
import { ExternalLink, UiIcon, getHumanizedDateTime } from '../ui';

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
import { UnknownIcon } from '@patternfly/react-icons/dist/js/icons/unknown-icon';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { hostStatus } from './status';
import { getApproveNodesInClLink } from '../../config';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

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
  openshiftVersion?: string;
};

const HostStatusPopoverContent: React.FC<HostStatusPopoverContentProps> = ({
  details,
  autoCSR,
  additionalPopoverContent,
  openshiftVersion,
  ...props
}) => {
  const { host } = props;
  const { status, statusInfo } = host;
  const { t } = useTranslation();
  if (['installing-in-progress'].includes(status)) {
    return (
      <Content>
        <HostProgress host={host} />
      </Content>
    );
  }

  if (['error', 'cancelled', 'installing-pending-user-action'].includes(status)) {
    return (
      <Content>
        <Content component="p">
          {details}
          <br />
          {toSentence(statusInfo)}
        </Content>
        <HostProgress host={host} />
      </Content>
    );
  }

  if (['installed'].includes(status)) {
    return (
      <Content>
        <Content component="p">{details}</Content>
        <HostProgress host={host} />
      </Content>
    );
  }

  if (['added-to-existing-cluster'].includes(status)) {
    return (
      <Content>
        <Content component="p">{details}</Content>
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
            <ExternalLink href={getApproveNodesInClLink(openshiftVersion)}>
              {t('ai:How to approve nodes using the CLI')}
            </ExternalLink>
          </>
        )}
        <HostProgress host={host} />
      </Content>
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
      <Content>
        <Content component="p">{details}</Content>
      </Content>
    );
  }

  return (
    <Stack hasGutter>
      {additionalPopoverContent}
      <StackItem>
        {details && (
          <Content>
            <Content component="p">{details}</Content>
          </Content>
        )}
        <HostValidationGroups openshiftVersion={openshiftVersion} {...props} />
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
    details?: string;
    zIndex?: number;
    autoCSR?: boolean;
    additionalPopoverContent?: React.ReactNode;
    openshiftVersion?: string;
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
    closeBtnAriaLabel={`close-popover-${props.host.requestedHostname ?? ''}`}
  >
    <Button variant={'link'} isInline size="sm">
      {props.children}
    </Button>
  </Popover>
);

const getHostStatusIcon = (
  icon: React.ReactNode,
  progress: HostProgressInfo | undefined,
  status: HostStatusProps['status'],
) => {
  if (progress?.stageTimedOut !== undefined && status.title !== 'Error') {
    return (
      <Popover
        bodyContent={
          <small>
            Waiting for control plane has been active more than the expected completion time.
          </small>
        }
        minWidth="20rem"
        maxWidth="30rem"
      >
        <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />
      </Popover>
    );
  } else return icon;
};

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
  openshiftVersion,
}) => {
  const [keepOnOutsideClick, onValidationActionToggle] = React.useState(false);

  const toggleHostname = React.useCallback(() => {
    onValidationActionToggle(!keepOnOutsideClick);
    onEditHostname?.();
  }, [keepOnOutsideClick, onEditHostname]);

  const { t } = useTranslation();

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
    openshiftVersion,
  };

  const hostIcon = getHostStatusIcon(icon, host.progress, status);
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
      {
        <FlexItem>
          {(autoCSR && status.key === 'added-to-existing-cluster'
            ? hostStatus(t).installed.icon
            : hostIcon) || <UnknownIcon />}
        </FlexItem>
      }

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {!children && !sublabel && !noPopover ? (
          <WithHostStatusPopover {...popoverProps}>{titleWithProgress}</WithHostStatusPopover>
        ) : (
          <FlexItem>{titleWithProgress}</FlexItem>
        )}
        {children && <FlexItem>{children}</FlexItem>}
        {sublabel && (
          <FlexItem
            className="pf-v6-u-font-size-xs"
            style={{ marginTop: 'calc(-1 * var(--pf-v6-l-flex--spacer--xs))' }}
          >
            <WithHostStatusPopover {...popoverProps}>{sublabel}</WithHostStatusPopover>
          </FlexItem>
        )}
      </Flex>
    </Flex>
  );
};

export default HostStatus;
