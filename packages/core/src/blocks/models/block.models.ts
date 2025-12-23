import type { BlockVariant } from "./variants/block-variant.models";
import type { BulletListVariant } from "./variants/bullet-list/bullet-list-block.models";
import type { CalloutVariant } from "./variants/callout/callout-block.models";
import type { HeadingVariant } from "./variants/heading/heading-block.models";
import type { QuoteVariant } from "./variants/quote/quote-block.models";
import type { TextVariant } from "./variants/text/text-block.models";
import type { ToggleListVariant } from "./variants/toggle-list/toggle-list.models";

export interface DocumentNode {
  id: string;
  children?: Block[];
}

type ConstructBlock<T extends BlockVariant> = DocumentNode &
  T & { parentId: string };

export type HeadingBlock = ConstructBlock<HeadingVariant>;
export type TextBlock = ConstructBlock<TextVariant>;
export type ToggleListBlock = ConstructBlock<ToggleListVariant>;
export type QuoteBlock = ConstructBlock<QuoteVariant>;
export type CalloutBlock = ConstructBlock<CalloutVariant>;
export type BulletListBlock = ConstructBlock<BulletListVariant>;

export type Block =
  | HeadingBlock
  | TextBlock
  | ToggleListBlock
  | QuoteBlock
  | CalloutBlock
  | BulletListBlock;
