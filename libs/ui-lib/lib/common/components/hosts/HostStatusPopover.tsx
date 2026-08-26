import React from 'react';
import { Button, Popover } from '@patternfly/react-core';
import { PopoverProps } from '@patternfly/react-core/dist/js/components/Popover/Popover';
import {
  HostStatusPopoverContent,
  HostStatusPopoverContentProps,
} from './HostStatusPopoverContent';
import { HostStatusPopoverFooter } from './HostStatusPopoverFooter';

type HostStatusPopoverProps = HostStatusPopoverContentProps & {
  hideOnOutsideClick: PopoverProps['hideOnOutsideClick'];
  title: string;
  zIndex?: number;
};

export const HostStatusPopover: React.FC<React.PropsWithChildren<HostStatusPopoverProps>> = ({
  hideOnOutsideClick,
  host,
  onEditHostname,
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
  children,
}) => (
  <Popover
    headerContent={<div>{title}</div>}
    bodyContent={
      <div style={{ maxHeight: '33vh', overflow: 'auto' }}>
        <HostStatusPopoverContent
          host={host}
          validationsInfo={validationsInfo}
          details={details}
          autoCSR={autoCSR}
          additionalPopoverContent={additionalPopoverContent}
          additionalBMHInfo={additionalBMHInfo}
          openshiftVersion={openshiftVersion}
          onEditHostname={onEditHostname}
          AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
          NtpSyncFailureMessageComponent={NtpSyncFailureMessageComponent}
          UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
        />
      </div>
    }
    footerContent={<HostStatusPopoverFooter host={host} />}
    minWidth="30rem"
    maxWidth="50rem"
    hideOnOutsideClick={hideOnOutsideClick}
    zIndex={zIndex || 300}
    closeBtnAriaLabel={`close-popover-${host.requestedHostname ?? ''}`}
  >
    <Button variant={'link'} isInline size="sm">
      {children}
    </Button>
  </Popover>
);
