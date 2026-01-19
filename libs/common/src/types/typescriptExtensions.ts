//extract array element type
export type ArrayElementType<TWhere> = TWhere extends (infer U)[]
  ? U extends object
    ? U
    : never
  : never;

export type Optional<T, K extends keyof T> = Omit<T, K> & { [K in keyof T]?: T[K] };

export function isNonNullObject(val: unknown): val is object {
  return typeof val === 'object' && val !== null;
}

// Still, as of June 18, 2022, Typescript cannot use the 'in' keyword or 'hasOwnProperty' method as a type guard
// See: https://github.com/microsoft/TypeScript/issues/21732
export function hasProp<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return prop in obj;
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
