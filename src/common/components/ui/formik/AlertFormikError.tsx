import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';

export const AlertFormikError = (statusFormik: any, actionClose?: React.ReactNode) => {
  return (
    <>
      <Alert
        variant={AlertVariant.danger}
        title={statusFormik?.error?.title}
        isInline
        actionClose={actionClose}
      >
        {statusFormik?.error?.message}
      </Alert>
    </>
  );
};

export default AlertFormikError;
