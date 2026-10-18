import type {
  Block,
  BulletListBlock,
  CalloutBlock,
  HeadingBlock,
  QuoteBlock,
  TextBlock,
  ToggleListBlock,
} from "../../blocks/models/block.models";

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
