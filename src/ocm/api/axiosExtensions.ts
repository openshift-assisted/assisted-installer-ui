import { AxiosError } from 'axios';
import { Error as APIError, InfraError } from '../../common/api/types';

type APIErrorMixin = InfraError & APIError;

export type AIAxiosErrorType = AxiosError<APIErrorMixin, APIErrorMixin>;

// Implementation from Axios.isAxiosError v0.29.2, which is not available in OCM's version 0.17.x
export const isAxiosError = (error: unknown): error is AIAxiosErrorType => {
  const axiosError = error as AIAxiosErrorType;
  return axiosError !== null && typeof axiosError === 'object' && axiosError.isAxiosError === true;
};
