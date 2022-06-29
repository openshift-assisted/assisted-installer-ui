//extract array element type
export type ArrayElementType<TWhere> = TWhere extends (infer U)[]
  ? U extends object
    ? U
    : never
  : never;

export type Optional<T, K extends keyof T> = Omit<T, K> & { [K in keyof T]?: T[K] };
