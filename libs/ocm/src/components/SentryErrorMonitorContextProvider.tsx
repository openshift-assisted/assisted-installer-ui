import React from 'react';
import {
  ErrorMonitorContextProvider,
  ErrorSeverity,
  ExceptionReporter,
} from '@openshift-assisted/common/components/ErrorHandling/ErrorMonitorContext';
import { handleApiError } from '@openshift-assisted/common/api/utils';
import { isApiError } from '@openshift-assisted/common/api/utils';
import { captureException } from '../sentry';

export const SentryErrorMonitorContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const exceptionReporter: ExceptionReporter = (
    error: unknown,
    message?: string,
    severity?: ErrorSeverity,
  ) => {
    if (isApiError(error)) {
      handleApiError(error);
    } else {
      captureException(error, message, severity);
    }
  };
  return (
    <ErrorMonitorContextProvider {...{ exceptionReporter }}>{children}</ErrorMonitorContextProvider>
  );
};
