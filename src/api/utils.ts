import Axios, { AxiosError, AxiosPromise } from 'axios';
import _ from 'lodash';
import { addAlert } from '../features/alerts/alertsSlice';
import { captureException } from '../sentry';

type OnError = <T>(arg0: AxiosError<T>) => void;

export const handleApiError = <T>(error: AxiosError<T>, onError?: OnError) => {
  if (Axios.isCancel(error)) {
    captureException(error, 'Request canceled');
  } else {
    let message = `Error config: ${error.config}\n`;
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      message += `Response data: ${error.response.data}\n`;
      message += `Response status: ${error.response.status}\n`;
      message += `Response headers: ${error.response.headers}`;
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      message += `Request: ${error.request}`;
    } else {
      // Something happened in setting up the request that triggered an Error
      message += `Error: ${error.message}`;
    }
    captureException(error, message);
    if (onError) return onError(error);
  }
};

export const getErrorMessage = (error: AxiosError) =>
  error.response?.data?.reason || error.response?.data?.message || error.message;

export const stringToJSON = <T>(string: string | undefined): T | undefined => {
  if (string) {
    try {
      const camelCased = string.replace(
        /"([\w-]+)":/g,
        (_match, offset) => `"${_.camelCase(offset)}":`,
      );
      const json = JSON.parse(camelCased);
      return json;
    } catch (e) {
      console.error('Failed to parse api string', e, string);
    }
  } else {
    console.info('Empty api string received.');
  }
  return undefined;
};

export const removeProtocolFromURL = (url = '') => url.replace(/^(http|https):\/\//, '');

type FetchApiEndpointParams<T> = {
  apiCallback: () => AxiosPromise<T>;
  onSuccess: (data: T) => void;
  errorTitle: string;
  onError?: (e: AxiosError<T>) => void;
};

export const fetchApiEndpoint = <T>({
  apiCallback,
  onSuccess,
  onError,
  errorTitle,
}: FetchApiEndpointParams<T>) => {
  const fetchFunc = async () => {
    try {
      const { data } = await apiCallback();
      onSuccess(data);
    } catch (e) {
      handleApiError(e, () =>
        onError
          ? onError(e)
          : addAlert({
              title: errorTitle,
              message: getErrorMessage(e),
            }),
      );
    }
  };
  fetchFunc();
};
