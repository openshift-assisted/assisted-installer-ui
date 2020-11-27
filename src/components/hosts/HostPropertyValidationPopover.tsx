import React from 'react';
import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as successColor,
} from '@patternfly/react-tokens';
import { Validation } from '../../types/hosts';
import { HOST_VALIDATION_FAILURE_HINTS, HOST_VALIDATION_LABELS } from '../../config/constants';
import { toSentence } from '../ui/table/utils';

type ValidationPopoverProps = {
  validation: Validation;
};

const ValidationPopover: React.FC<ValidationPopoverProps> = ({ validation, children }) => {
  const failedValidationHint = HOST_VALIDATION_FAILURE_HINTS[validation.id];
  return (
    <Popover
      headerContent={<div>{HOST_VALIDATION_LABELS[validation.id]}</div>}
      bodyContent={
        <div>
          {toSentence(validation.message)}
          {validation.status === 'failure' && failedValidationHint && ` ${failedValidationHint}`}
        </div>
      }
    >
      <Button variant={ButtonVariant.link} isInline>
        {children}
      </Button>
    </Popover>
  );
};

type HostPropertyValidationPopoverProps = {
  validation?: Validation;
  showFailure?: boolean;
  showPending?: boolean;
  showSuccess?: boolean;
};

const HostPropertyValidationPopover: React.FC<HostPropertyValidationPopoverProps> = ({
  validation,
  children,
  showFailure = true,
  showPending = false,
  showSuccess = false,
}) => {
  if (validation) {
    if (showFailure && validation.status === 'failure') {
      return (
        <ValidationPopover validation={validation}>
          <ExclamationCircleIcon color={dangerColor.value} /> {children}
        </ValidationPopover>
      );
    }
    if (showPending && validation.status === 'pending') {
      return (
        <ValidationPopover validation={validation}>
          <PendingIcon /> {children}
        </ValidationPopover>
      );
    }
    if (showSuccess && validation.status === 'success') {
      return (
        <ValidationPopover validation={validation}>
          <CheckCircleIcon color={successColor.value} /> {children}
        </ValidationPopover>
      );
    }
  }
  return <>{children}</>;
};

export default HostPropertyValidationPopover;
