import type { Block } from "./block.models";
import type { BlockType } from "./block-type.models";
import type {
  BlockSplitContext,
  BlockSplitResult,
  BlockSplitRule,
} from "./common/block-split-rule.models";
import { bulletListItemBlockSplitRule } from "./bullet-list-item/bullet-list-item-block.split-rule";
import { toggleListBlockSplitRule } from "./toggle-list/toggle-list-block.split-rule";

type BlockSplitRules = {
  [TType in BlockType]?: BlockSplitRule<Extract<Block, { type: TType }>>;
};

export const BLOCK_SPLIT_RULES: BlockSplitRules = {
  "toggle-list": toggleListBlockSplitRule,
  "bullet-list-item": bulletListItemBlockSplitRule,
};

export const defaultBlockSplitRule = ({
  newBlockId,
  splitPosition,
  contentBefore,
  contentAfter,
}: BlockSplitContext<Block>): BlockSplitResult =>
  splitPosition === "start"
    ? {
        blockContent: contentAfter,
        newBlock: { id: newBlockId, type: "text", data: { content: [] } },
        placement: "before",
      }
    : {
        blockContent: contentBefore,
        newBlock: { id: newBlockId, type: "text", data: { content: contentAfter } },
        placement: "after",
      };
