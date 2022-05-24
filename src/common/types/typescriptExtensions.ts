//extract array element type
export type ArrayElementType<TWhere> = TWhere extends (infer U)[]
  ? U extends object
    ? U
    : never
  : never;
