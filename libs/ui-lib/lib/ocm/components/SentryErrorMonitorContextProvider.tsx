import React from 'react';
import {
  ErrorMonitorContextProvider,
  ErrorSeverity,
  ExceptionReporter,
} from '../../common/components/ErrorHandling/ErrorMonitorContext';
import { handleApiError } from '../../common/api';
import { isApiError } from '../../common/api/utils';
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
