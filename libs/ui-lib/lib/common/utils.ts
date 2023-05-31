import isString from 'lodash-es/isString.js';
import { load } from 'js-yaml';

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

export const validateFileType = (value: string) => {
  return isStringValidYAML(value) || isStringValidJSON(value);
};

export const isStringValidYAML = (input: string): boolean => {
  try {
    load(input);
    return true;
  } catch {
    return false;
  }
};

export const isStringValidJSON = (input: string): boolean => {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
};

export const validateFileSize = (value: string, fileSize: number): boolean => {
  const contentFile = new Blob([value], { type: 'text/plain;charset=utf-8' });
  return contentFile.size <= fileSize;
};

export const getMaxFileSizeMessage = (fileSize: number): string => {
  return `File size is too big. Upload a new ${fileSize / 1000} kB or less.`;
};
