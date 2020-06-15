import Axios, { AxiosError } from 'axios';

type OnError = <T>(arg0: AxiosError<T>) => void;

export const handleApiError = <T>(error: AxiosError<T>, onError?: OnError) => {
  if (Axios.isCancel(error)) {
    console.error('Request canceled:', error.message);
  } else {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }
    console.error('Error config:', error.config);
    if (onError) return onError(error);
  }
};

export const getErrorMessage = (error: AxiosError) =>
  error.response?.data?.reason || error.response?.data?.message;

const toCamelCase = (str: string): string =>
  str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));

export const stringToJSON = <T>(string: string | undefined): T | undefined => {
  if (string) {
    try {
      const camelCased = string.replace(
        /"([\w]+)":/g,
        (_match, offset) => `"${toCamelCase(offset)}":`,
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
