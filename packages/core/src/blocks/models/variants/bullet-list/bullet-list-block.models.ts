import type { BlockVariantBase } from "../block-variant.models";

export interface BulletListVariantData {}

export type BulletListVariant = BlockVariantBase<
  "bullet-list",
  BulletListVariantData
>;
