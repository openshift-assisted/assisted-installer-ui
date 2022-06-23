import * as Sentry from '@sentry/browser';
import { getAssistedUiLibVersion } from '../common/config/constants';
import { ocmClient } from './api/axiosClient';

export const captureException = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  message?: string,
  severity: Sentry.Severity = Sentry.Severity.Error,
) => {
  if (ocmClient) {
    const body = {
      level: severity,
      tags: {
        app_section: 'assisted-ui-lib',
        section_version: getAssistedUiLibVersion(),
      },
    };
    message && Sentry.captureMessage(message, body);
    Sentry.captureException(error, body);
  } else {
    severity === Sentry.Severity.Error
      ? console.error(message, error)
      : console.warn(message, error);
  }
};
