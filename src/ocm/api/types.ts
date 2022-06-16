import { isAxiosError, AIAxiosErrorType } from './axiosExtensions';

export const isApiError = (error: unknown): error is AIAxiosErrorType => {
  if (!isAxiosError(error)) {
    return false;
  }
  return typeof error.response?.data === 'object';
};
