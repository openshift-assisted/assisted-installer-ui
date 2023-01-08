import * as Sentry from '@sentry/browser';
import { ocmClient } from './api/axiosClient';

export const captureException = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  message?: string,
  severity: Sentry.SeverityLevel = 'error',
) => {
  if (ocmClient) {
    message && Sentry.captureMessage(message, severity);
    Sentry.captureException(error);
  } else {
    severity === 'error'
      ? console.error(message, error)
      : console.warn(message, error);
  }
};
