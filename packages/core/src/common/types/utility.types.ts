export type Nullish<T> = T | null | undefined;

export type NotPromise<T> = T & (T extends PromiseLike<unknown> ? never : unknown);
