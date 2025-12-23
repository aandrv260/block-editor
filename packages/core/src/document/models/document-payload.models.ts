import type { BlockVariant } from "../../blocks/models/variants/block-variant.models";
import type { BulletListVariant } from "../../blocks/models/variants/bullet-list/bullet-list-block.models";
import type { CalloutVariant } from "../../blocks/models/variants/callout/callout-block.models";
import type { HeadingVariant } from "../../blocks/models/variants/heading/heading-block.models";
import type { QuoteVariant } from "../../blocks/models/variants/quote/quote-block.models";
import type { TextVariant } from "../../blocks/models/variants/text/text-block.models";
import type { ToggleListVariant } from "../../blocks/models/variants/toggle-list/toggle-list.models";

export interface BlockPayloadBase {
  id: string;
  children?: BlockPayload[];
}

type ConstructVariantBlock<T extends BlockVariant> = BlockPayloadBase & T;

type HeadingBlockPayload = ConstructVariantBlock<HeadingVariant>;
type TextBlockPayload = ConstructVariantBlock<TextVariant>;
type ToggleListBlockPayload = ConstructVariantBlock<ToggleListVariant>;
type QuoteBlockPayload = ConstructVariantBlock<QuoteVariant>;
type CalloutBlockPayload = ConstructVariantBlock<CalloutVariant>;
type BulletListBlockPayload = ConstructVariantBlock<BulletListVariant>;

export type BlockPayload =
  | HeadingBlockPayload
  | TextBlockPayload
  | ToggleListBlockPayload
  | QuoteBlockPayload
  | CalloutBlockPayload
  | BulletListBlockPayload;
