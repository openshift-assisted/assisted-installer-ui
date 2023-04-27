import { AxiosError } from 'axios';
import { hasProp, isNonNullObject } from '../../common/types';

// Implementation from Axios.isAxiosError v0.29.2, which is not available in OCM's version 0.17.x
export function isAxiosError<T = unknown, D = unknown>(
  payload: unknown,
): payload is AxiosError<T, D> {
  return (
    isNonNullObject(payload) && hasProp(payload, 'isAxiosError') && payload.isAxiosError === true
  );
}
