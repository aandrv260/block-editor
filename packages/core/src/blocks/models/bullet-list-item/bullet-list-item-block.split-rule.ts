import type { BlockSplitRule } from "../common/block-split-rule.models";
import type { BulletListItemBlock } from "./bullet-list-item-block.schema";

export const bulletListItemBlockSplitRule: BlockSplitRule<BulletListItemBlock> = ({
  newBlockId,
  splitPosition,
  contentBefore,
  contentAfter,
}) => {
  if (splitPosition === "start") {
    return {
      blockContent: contentAfter,
      newBlock: {
        id: newBlockId,
        type: "bullet-list-item",
        data: { content: [] },
        children: [],
      },
      placement: "before",
    };
  }

  return {
    blockContent: contentBefore,
    newBlock: {
      id: newBlockId,
      type: "bullet-list-item",
      data: { content: contentAfter },
      children: [],
    },
    placement: "after",
  };
};
