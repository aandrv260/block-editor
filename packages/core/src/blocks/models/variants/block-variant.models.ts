import type { BlockType } from "../block-type.models";
import type { BulletListVariant } from "./bullet-list/bullet-list-block.models";
import type { CalloutVariant } from "./callout/callout-block.models";
import type { HeadingVariant } from "./heading/heading-block.models";
import type { QuoteVariant } from "./quote/quote-block.models";
import type { TextVariant } from "./text/text-block.models";
import type { ToggleListVariant } from "./toggle-list/toggle-list.models";

export interface BlockVariantBase<Type extends BlockType, TData extends object> {
  type: Type;
  data: TData;
}

export type BlockVariant =
  | HeadingVariant
  | TextVariant
  | ToggleListVariant
  | QuoteVariant
  | CalloutVariant
  | BulletListVariant;

export const BLOCK_VARIANT_HAS_CHILDREN_MAPPING = {
  text: false,
  heading: false,
  "toggle-list": true,
  quote: false,
  callout: false,
  "bullet-list": true,
} as const satisfies Record<BlockType, boolean>;

export type BlockVariantHasChildrenMapping =
  typeof BLOCK_VARIANT_HAS_CHILDREN_MAPPING;
