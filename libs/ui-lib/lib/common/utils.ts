import filesize from 'filesize.js';
import camelCase from 'lodash-es/camelCase.js';
import isString from 'lodash-es/isString.js';
import { loadAll } from 'js-yaml';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_OFFSET_FACTOR } from './configurations';

export const FILENAME_REGEX = /^[^\/]*\.(yaml|yml|json)$/;
export const FILE_TYPE_MESSAGE = 'Unsupported file type. Please provide a valid YAML file.';
export const INCORRECT_TYPE_FILE_MESSAGE =
  'File type is not supported. File type must be yaml, yml or json.';

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
    loadAll(input);
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

export const fileSize: typeof filesize = (...args) =>
  filesize
    .call(null, ...args)
    .toUpperCase()
    .replace(/I/, 'i');

export const getMaxFileSizeMessage = `File size is too big. The file size must be less than ${fileSize(
  MAX_FILE_SIZE_BYTES,
  0,
  'si',
)}.`;

export const validateFileName = (fileName: string) => {
  return new RegExp(FILENAME_REGEX).test(fileName || '');
};

export const stringToJSON = <T>(jsonString: string | undefined): T | undefined => {
  let jsObject: T | undefined;
  if (jsonString) {
    try {
      const camelCased = jsonString.replace(
        /"([\w-]+)":/g,
        (_match, offset: string) => `"${camelCase(offset)}":`,
      );
      jsObject = JSON.parse(camelCased) as T;
    } catch (e) {
      // console.error('Failed to parse api string', e, jsonString);
    }
  } else {
    // console.info('Empty api string received.');
  }

  return jsObject;
};

export const downloadFile = (fileUrl?: string, dataBlob?: Blob, fileName?: string) => {
  const link = document.createElement('a');
  if (fileUrl && fileUrl !== '') {
    link.setAttribute('href', fileUrl);
  }
  if (dataBlob) {
    const file = new Blob([dataBlob], { type: 'text' });
    link.setAttribute('href', URL.createObjectURL(file));
  }
  if (fileName) {
    link.setAttribute('download', fileName);
  }
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
