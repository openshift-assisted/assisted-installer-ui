import * as Sentry from '@sentry/browser';
import { ErrorSeverity } from '../common/errorHandling/ErrorHandlerContext';
import { ocmClient } from './api/axiosClient';

export const captureException = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  message?: string,
  severity: ErrorSeverity = 'error',
) => {
  if (ocmClient) {
    message && Sentry.captureMessage(message, severity as Sentry.Severity);
    Sentry.captureException(error);
  } else {
    severity === Sentry.Severity.Error
      ? console.error(message, error)
      : console.warn(message, error);
  }
};

export const captureMessage = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: string,
  severity: ErrorSeverity = 'error',
) => {
  if (ocmClient) {
    Sentry.captureMessage(message, severity as Sentry.Severity);
  } else {
    severity === Sentry.Severity.Error ? console.error(message) : console.warn(message);
  }
};
