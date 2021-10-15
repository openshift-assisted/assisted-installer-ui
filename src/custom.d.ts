declare type Optional<T, K extends keyof T> = Omit<T, K> & { [K in keyof T]?: T[K] };
