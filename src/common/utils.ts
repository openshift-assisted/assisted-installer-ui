import isString from 'lodash/isString';
import { isApiError } from './api/customTypes';

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'Unexpected error';
};

export const getApiErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.response?.data.reason || error.message;
  }
  return getErrorMessage(error);
};
