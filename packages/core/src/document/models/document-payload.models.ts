import type { Block } from "../../blocks/models/block.models";
import type { BulletListBlock } from "../../blocks/models/bullet-list/bullet-list-block.schema";
import type { CalloutBlock } from "../../blocks/models/callout/callout-block.schema";
import type { HeadingBlock } from "../../blocks/models/heading/heading-block.schema";
import type { QuoteBlock } from "../../blocks/models/quote/quote-block.schema";
import type { TextBlock } from "../../blocks/models/text/text-block.schema";
import type { ToggleListBlock } from "../../blocks/models/toggle-list/toggle-list-block.schema";

interface BlockPayloadBase {
  children?: BlockPayload[];
}

type BlockPayloadOf<TBlock extends Block> = Omit<TBlock, "parentId" | "children"> &
  BlockPayloadBase;

export type BlockPayload =
  | BlockPayloadOf<HeadingBlock>
  | BlockPayloadOf<TextBlock>
  | BlockPayloadOf<ToggleListBlock>
  | BlockPayloadOf<QuoteBlock>
  | BlockPayloadOf<CalloutBlock>
  | BlockPayloadOf<BulletListBlock>;
