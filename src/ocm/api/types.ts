import Axios, { AxiosError } from 'axios';
import { Error as APIError, InfraError } from '../../common/api/types';

export type APIErrorMixin = InfraError & APIError;

export const isApiError = (error: unknown): error is AxiosError<APIErrorMixin, APIErrorMixin> => {
  if (!Axios.isAxiosError(error)) {
    return false;
  }
  return typeof error.response?.data === 'object';
};
