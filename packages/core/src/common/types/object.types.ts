type Primitive = string | number | boolean | bigint | null | undefined | symbol;
type AnyFunction = (...args: unknown[]) => unknown;

export type DeepReadonly<T> = T extends
  | Primitive
  | Date
  | AnyFunction
  | Set<unknown>
  | Map<unknown, unknown>
  ? T
  : T extends (infer U extends Primitive)[]
    ? readonly U[]
    : T extends object
      ? {
          readonly [K in keyof T]: DeepReadonly<T[K]>;
        }
      : never;
