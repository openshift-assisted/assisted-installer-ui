import { Severity } from '@sentry/browser';
import Axios, { AxiosError } from 'axios';
import pick from 'lodash/pick';
import { captureException } from '../sentry';
import { APIErrorMixin } from './types';

type OnError = (arg0: AxiosError<APIErrorMixin, APIErrorMixin>) => void;

export const handleApiError = (
  error: AxiosError<APIErrorMixin, APIErrorMixin>,
  onError?: OnError,
) => {
  if (Axios.isCancel(error)) {
    captureException(error, 'Request canceled', Severity.Info);
  } else {
    let message = `URL: ${JSON.stringify(error.config.url, null, 1)}\n`;
    message += `Method: ${JSON.stringify(error.config.method, null, 1)}\n`;
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      message += `Status: ${error.response.status}\n`;
      message += `Response: ${JSON.stringify(
        pick(error.response.data, ['code', 'message', 'reason']),
        null,
        1,
      )}\n`;
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      message += `Status Code: ${JSON.stringify(
        error.request.__sentry_xhr__.status_code,
        null,
        1,
      )}`;
    }
    captureException(error, message);
    if (onError) return onError(error);
  }
};

export const getErrorMessage = (error: AxiosError<APIErrorMixin>) =>
  error.response?.data.message || error.response?.data.reason || error.message;
