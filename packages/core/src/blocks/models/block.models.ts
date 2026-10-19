import type { TextRun } from "./content/content.schema";
import type { BulletListBlock } from "./bullet-list/bullet-list-block.schema";
import type { CalloutBlock } from "./callout/callout-block.schema";
import type { HeadingBlock } from "./heading/heading-block.schema";
import type { QuoteBlock } from "./quote/quote-block.schema";
import type { TextBlock } from "./text/text-block.schema";
import type { ToggleListBlock } from "./toggle-list/toggle-list-block.schema";

export interface DocumentNode {
  id: string;
  children?: Block[];
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ToggleListBlock
  | QuoteBlock
  | CalloutBlock
  | BulletListBlock;

export type ContentBlock = Extract<Block, { data: { content: TextRun[] } }>;
