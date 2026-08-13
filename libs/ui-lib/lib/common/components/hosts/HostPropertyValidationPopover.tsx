import React from 'react';
import { Button, ButtonVariant, Flex, Icon, Popover } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { toSentence } from '../ui';
import { hostValidationLabels } from '../../config';
import { Validation } from '../../types/hosts';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type ValidationPopoverProps = {
  validation: Validation;
  actions?: React.ReactNode[];
  additionalBodyContent?: React.ReactNode;
};

const ValidationPopover: React.FC<React.PropsWithChildren<ValidationPopoverProps>> = ({
  validation,
  actions,
  additionalBodyContent,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Popover
      headerContent={<div>{hostValidationLabels(t)[validation.id]}</div>}
      bodyContent={
        <div>
          {toSentence(validation.message)}
          {additionalBodyContent && ' '}
          {additionalBodyContent}
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
  failureBodyContent?: React.ReactNode;
  showFailure?: boolean;
  showSuccess?: boolean;
};

export const HostPropertyValidationPopover: React.FC<
  React.PropsWithChildren<HostPropertyValidationPopoverProps>
> = ({
  validation,
  failureActions,
  failureBodyContent,
  children,
  showFailure = true,
  showSuccess = false,
}) => {
  if (validation) {
    if (showFailure && validation.status === 'failure') {
      return (
        <ValidationPopover
          validation={validation}
          actions={failureActions}
          additionalBodyContent={failureBodyContent}
        >
          <Flex columnGap={{ default: 'columnGapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <Icon status="danger">
              <ExclamationCircleIcon />
            </Icon>{' '}
            {children}
          </Flex>
        </ValidationPopover>
      );
    }
    if (showSuccess && validation.status === 'success') {
      return (
        <>
          <Flex columnGap={{ default: 'columnGapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
            <Icon status="success">
              <CheckCircleIcon />
            </Icon>{' '}
            {children}
          </Flex>
        </>
      );
    }
  }
  return <>{children}</>;
};
