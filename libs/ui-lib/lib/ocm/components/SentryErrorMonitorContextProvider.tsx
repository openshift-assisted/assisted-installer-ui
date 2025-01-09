import React from 'react';
import {
  ErrorMonitorContextProvider,
  ErrorSeverity,
  ExceptionReporter,
} from '../../common/components/ErrorHandling/ErrorMonitorContext';
import { handleApiError } from '../../common/api';
import { isApiError } from '../../common/api/utils';
import { captureException } from '../sentry';
import * as Sentry from '@sentry/browser';

export const SentryErrorMonitorContextProvider: React.FC = ({ children }) => {
  const exceptionReporter: ExceptionReporter = (
    error: unknown,
    message?: string,
    severity?: ErrorSeverity,
  ) => {
    if (isApiError(error)) {
      handleApiError(error);
    } else {
      captureException(error, message, severity as Sentry.Severity);
    }
  };
  return (
    <ErrorMonitorContextProvider {...{ exceptionReporter }}>{children}</ErrorMonitorContextProvider>
  );
};
