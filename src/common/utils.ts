import isString from 'lodash/isString';

export const getErrorMessage = (error: unknown, fallbackMessage?: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return fallbackMessage ? fallbackMessage : 'Unexpected error';
};
