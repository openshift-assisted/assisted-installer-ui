import * as Sentry from '@sentry/browser';
import { ErrorHandler, ErrorSeverity } from '../common/types/errorHandling';
import { ocmClient } from './api/axiosClient';

export const captureException: ErrorHandler = (
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
