import React from 'react';
import { Button, ButtonVariant, Flex, Popover } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';
import { t_global_icon_color_status_danger_default as dangerColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_danger_default';
import { t_global_color_status_success_default as successColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { toSentence } from '../ui';
import { hostValidationFailureHints, hostValidationLabels } from '../../config';
import { Validation } from '../../types/hosts';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type ValidationPopoverProps = {
  validation: Validation;
  actions?: React.ReactNode[];
};

const ValidationPopover: React.FC<ValidationPopoverProps> = ({ validation, actions, children }) => {
  const { t } = useTranslation();
  const failedValidationHint = hostValidationFailureHints(t)[validation.id];

  return (
    <Popover
      headerContent={<div>{hostValidationLabels(t)[validation.id]}</div>}
      bodyContent={
        <div>
          {toSentence(validation.message)}
          {validation.status === 'failure' && failedValidationHint && ` ${failedValidationHint}`}
        </div>
      }
      footerContent={actions}
      zIndex={300}
    >
      <Button variant={ButtonVariant.link} isInline>
        {children}
      </Button>
    </Popover>
  );
};

type HostPropertyValidationPopoverProps = {
  validation?: Validation;
  failureActions?: React.ReactNode[];
  pendingActions?: React.ReactNode[];
  showFailure?: boolean;
  showPending?: boolean;
  showSuccess?: boolean;
};

const HostPropertyValidationPopover: React.FC<HostPropertyValidationPopoverProps> = ({
  validation,
  failureActions,
  pendingActions,
  children,
  showFailure = true,
  showPending = false,
  showSuccess = false,
}) => {
  if (validation) {
    if (showFailure && validation.status === 'failure') {
      return (
        <ValidationPopover validation={validation} actions={failureActions}>
          <Flex columnGap={{ default: 'columnGapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <ExclamationCircleIcon color={dangerColor.value} /> {children}
          </Flex>
        </ValidationPopover>
      );
    }
    if (showPending && validation.status === 'pending') {
      return (
        <ValidationPopover validation={validation} actions={pendingActions}>
          <Flex columnGap={{ default: 'columnGapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <PendingIcon /> {children}
          </Flex>
        </ValidationPopover>
      );
    }
    if (showSuccess && validation.status === 'success') {
      return (
        <>
          <Flex columnGap={{ default: 'columnGapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <CheckCircleIcon color={successColor.value} /> {children}
          </Flex>
        </>
      );
    }
  }
  return <>{children}</>;
};

export default HostPropertyValidationPopover;
