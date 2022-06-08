import { AxiosError } from 'axios';
import { Error as APIError, InfraError } from '../../common/api/types';

export type APIErrorMixin = InfraError & APIError;

// Implementation from Axios.isAxiosError v0.29.2, which is not available in OCM's version 0.17.x
const isAxiosError = (error: unknown): error is AxiosError<APIErrorMixin, APIErrorMixin> => {
  const axiosError = error as AxiosError<APIErrorMixin, APIErrorMixin>;
  return axiosError !== null && typeof axiosError === 'object' && axiosError.isAxiosError === true;
};

export const isApiError = (error: unknown): error is AxiosError<APIErrorMixin, APIErrorMixin> => {
  if (!isAxiosError(error)) {
    return false;
  }
  return typeof error.response?.data === 'object';
};
