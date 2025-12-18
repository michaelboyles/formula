export type Setter<T> = T | ((old: T) => T)
