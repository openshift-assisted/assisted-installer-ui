import isString from 'lodash-es/isString.js';
import { load } from 'js-yaml';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_OFFSET_FACTOR } from './configurations';
import { fileSize } from './components/hosts/utils';

export const FILENAME_REGEX = /^[^\/]*\.(yaml|yml|json)$/;
export const FILE_TYPE_MESSAGE = 'Unsupported file type. Please provide a valid YAML file.';

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

export const validateFileSize = (value: string): boolean => {
  const contentFile = new Blob([value], { type: 'text/plain;charset=utf-8' });
  return contentFile.size <= MAX_FILE_SIZE_BYTES * MAX_FILE_SIZE_OFFSET_FACTOR;
};

export const getMaxFileSizeMessage = (): string => {
  return `File size is too big. Upload a new ${fileSize(
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_OFFSET_FACTOR,
    'Kb',
  )} or less.`;
};

export const validateFileName = (fileName: string) => {
  return new RegExp(FILENAME_REGEX).test((fileName || '').toString());
};
