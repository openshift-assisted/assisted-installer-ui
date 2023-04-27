import React from 'react';
import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';
import { StatusErrorType } from '../../../types';

type AlertFormikErrorProps = {
  status: StatusErrorType;
  onClose?: () => void;
};

export const AlertFormikError = ({ status, onClose }: AlertFormikErrorProps) => {
  if (!status || !status.error) {
    return null;
  }
  const actionClose = onClose ? <AlertActionCloseButton onClose={onClose} /> : undefined;

  return (
    <>
      <Alert
        variant={AlertVariant.danger}
        title={status.error.title}
        isInline
        actionClose={actionClose}
      >
        {status.error.message}
      </Alert>
    </>
  );
};

export default AlertFormikError;
