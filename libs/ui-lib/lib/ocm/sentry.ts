import * as Sentry from '@sentry/browser';
import { isInOcm } from '../common/api/axiosClient';

export const captureException = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  message?: string,
  severity: Sentry.Severity = Sentry.Severity.Error,
) => {
  if (isInOcm) {
    message && Sentry.captureMessage(message, severity);
    Sentry.captureException(error);
  } else {
    // severity === Sentry.Severity.Error
    //   ? console.error(message, error)
    //   : console.warn(message, error);
  }
};
