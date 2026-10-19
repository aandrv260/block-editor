import type { BlockSplitRule } from "../common/block-split-rule.models";
import type { ToggleListBlock } from "./toggle-list-block.schema";

export const toggleListBlockSplitRule: BlockSplitRule<ToggleListBlock> = ({
  block,
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
        type: "toggle-list",
        data: { open: false, content: [] },
        children: [],
      },
      placement: "before",
    };
  }

  if (block.data.open) {
    return {
      blockContent: contentBefore,
      newBlock: { id: newBlockId, type: "text", data: { content: contentAfter } },
      placement: "first-child",
    };
  }

  return {
    blockContent: contentBefore,
    newBlock: {
      id: newBlockId,
      type: "toggle-list",
      data: { open: false, content: contentAfter },
      children: [],
    },
    placement: "after",
  };
};
