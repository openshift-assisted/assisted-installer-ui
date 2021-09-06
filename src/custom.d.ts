declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare type Optional<T, K extends keyof T> = Omit<T, K> & { [K in keyof T]?: T[K] };

declare module 'fuzzysearch';
