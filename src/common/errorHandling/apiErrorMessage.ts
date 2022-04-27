import { AxiosError } from 'axios';
import { APIErrorMixin } from '../../ocm/api/types';
import pick from 'lodash/pick';

export const generateApiErrorMessage = (
  error: AxiosError<APIErrorMixin, APIErrorMixin>,
): string => {
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
    message += `Status Code: ${JSON.stringify(error.request.__sentry_xhr__.status_code, null, 1)}`;
  }
  return message;
};
