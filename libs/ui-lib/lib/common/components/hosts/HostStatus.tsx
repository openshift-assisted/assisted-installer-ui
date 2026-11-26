import React from 'react';
import { Popover, FlexItem, Flex, Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { UnknownIcon } from '@patternfly/react-icons/dist/js/icons/unknown-icon';

import { Host, HostProgressInfo } from '@openshift-assisted/types/assisted-installer-service';

import { getHostProgressStageNumber, getHostProgressStages } from './utils';
import { HostStatusPopover } from './HostStatusPopover';
import { HostStatusProps } from './types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { hostStatus } from './status';

const getTitleWithProgress = (host: Host, status: HostStatusProps['status']) => {
  const stages = getHostProgressStages(host);
  const stageNumber = getHostProgressStageNumber(host);
  return status.withProgress ? `${status.title} ${stageNumber}/${stages.length}` : status.title;
};

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
        <Icon size="sm" status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      </Popover>
    );
  }
  return icon;
};

const HostStatus: React.FC<React.PropsWithChildren<HostStatusProps>> = ({
  host,
  validationsInfo,
  status,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  NtpSyncFailureMessageComponent,
  UpdateDay2ApiVipDialogToggleComponent,
  children,
  zIndex,
  autoCSR,
  additionalPopoverContent,
  additionalBMHInfo,
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
  const hostIcon = getHostStatusIcon(icon, host.progress, status);

  const hostStatusPopoverProps = {
    hideOnOutsideClick: !keepOnOutsideClick,
    host,
    onEditHostname: toggleHostname,
    title,
    validationsInfo,
    details,
    zIndex,
    autoCSR,
    additionalPopoverContent,
    additionalBMHInfo,
    openshiftVersion,
    AdditionalNTPSourcesDialogToggleComponent,
    NtpSyncFailureMessageComponent,
    UpdateDay2ApiVipDialogToggleComponent,
  };

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsXs' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem>
        {(autoCSR && status.key === 'added-to-existing-cluster'
          ? hostStatus(t).installed.icon
          : hostIcon) || <UnknownIcon />}
      </FlexItem>

      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {!children && !sublabel && !noPopover ? (
          <HostStatusPopover {...hostStatusPopoverProps} label={titleWithProgress} />
        ) : (
          <FlexItem>{titleWithProgress}</FlexItem>
        )}
        {children && <FlexItem>{children}</FlexItem>}
        {sublabel && (
          <FlexItem
            className="pf-v6-u-font-size-xs"
            style={{ marginTop: 'calc(-1 * var(--pf-v6-l-flex--spacer--xs))' }}
          >
            <HostStatusPopover {...hostStatusPopoverProps} label={sublabel} />
          </FlexItem>
        )}
      </Flex>
    </Flex>
  );
};

export default HostStatus;
