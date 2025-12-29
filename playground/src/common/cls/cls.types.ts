export type PropsWithChildrenRequired = Readonly<{
  children: React.ReactNode;
}>;

export type ClassProp =
  | Record<string, boolean | null | undefined>
  | string
  | number
  | undefined
  | null;
