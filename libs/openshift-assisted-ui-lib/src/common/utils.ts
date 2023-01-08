import isString from 'lodash/isString';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'Unexpected error';
};

export const getRandomString = (length: number) =>
  Array(length + 1)
    .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
    .slice(0, length);

export const getKeys = <T extends object>(obj: T) => Object.keys(obj) as Array<keyof T>;
