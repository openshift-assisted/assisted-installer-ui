import { AxiosError } from 'axios';
import { isAxiosError } from './axiosExtensions';
import { Error as APIError, InfraError } from '../../common/api/types';

export type APIErrorMixin = InfraError & APIError;
export type AIAxiosErrorType = AxiosError<APIErrorMixin, APIErrorMixin>;

export const isApiError = (error: unknown): error is AIAxiosErrorType => {
  if (!isAxiosError<AIAxiosErrorType, AIAxiosErrorType>(error)) {
    return false;
  }
  return typeof error.response?.data === 'object';
};
