import { AxiosError } from 'axios';

function isNonNullObject(val: unknown): val is object {
  return typeof val === 'object' && val !== null;
}

// Still, as of June 18, 2022, Typescript cannot use the 'in' keyword or 'hasOwnProperty' method as a type guard
// See: https://github.com/microsoft/TypeScript/issues/21732
function hasProp<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return prop in obj;
}

// Implementation from Axios.isAxiosError v0.29.2, which is not available in OCM's version 0.17.x
export function isAxiosError<T = unknown, D = unknown>(
  payload: unknown,
): payload is AxiosError<T, D> {
  return (
    isNonNullObject(payload) && hasProp(payload, 'isAxiosError') && payload.isAxiosError === true
  );
}
