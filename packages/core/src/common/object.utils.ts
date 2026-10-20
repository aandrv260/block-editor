export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getObjectKeys = <T extends object>(object: T): (keyof T)[] =>
  Object.keys(object) as (keyof T)[];

export const getObjectEntries = <T extends object>(
  object: T,
): { [TKey in keyof T]: [TKey, T[TKey]] }[keyof T][] =>
  Object.entries(object) as { [TKey in keyof T]: [TKey, T[TKey]] }[keyof T][];
