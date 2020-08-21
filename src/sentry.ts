import * as Sentry from '@sentry/browser';
import { ocmClient } from './api/axiosClient';

export enum SEVERITY {
  ERROR = 'error',
  WARN = 'warning',
}

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export const captureException = (error, message?: string, severity: SEVERITY = SEVERITY.ERROR) => {
  if (ocmClient) {
    message && Sentry.captureMessage(message, SEVERITY[severity]);
    Sentry.captureException(error);
  } else {
    severity === SEVERITY.ERROR ? console.error(message, error) : console.warn(message, error);
  }
};
