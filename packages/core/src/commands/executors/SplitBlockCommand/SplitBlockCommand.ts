import type { Block } from "../../../blocks/models/block.models";
import {
  BLOCK_SPLIT_RULES,
  defaultBlockSplitRule,
} from "../../../blocks/models/block.split-rules";
import type {
  BlockSplitContext,
  BlockSplitPlacement,
  BlockSplitPosition,
  BlockSplitRule,
} from "../../../blocks/models/common/block-split-rule.models";
import {
  areContentsEqual,
  getPlainText,
  splitContent,
} from "../../../blocks/utils/content.utils";
import type { EditorDocument } from "../../../document/EditorDocument";
import type { BlockPayload } from "../../../document/models/document-payload.models";
import { getChildren } from "../../../document/utils/block-children.utils";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext, CommandResult } from "../commandExecutors.models";
import { getBlockToEdit, updateBlockContent } from "../utils/edit-text.utils";

export interface SplitBlockPayload {
  blockId: string;
  offset: number;
  newBlockId: string;
}

export const splitBlockCommand = ({
  payload,
  document,
}: CommandContext<SplitBlockPayload>): CommandResult => {
  const { blockId, offset, newBlockId } = payload;
  const block = getBlockToEdit(document, { blockId, from: offset, to: offset });
  const [contentBefore, contentAfter] = splitContent(block.data.content, offset);

  const splitContext: BlockSplitContext<Block> = {
    block,
    newBlockId,
    splitPosition: getSplitPosition(offset, getPlainText(block.data.content).length),
    contentBefore,
    contentAfter,
  };

  const splitRule = BLOCK_SPLIT_RULES[block.type] as
    | BlockSplitRule<Block>
    | undefined;

  const { blockContent, newBlock, placement } =
    splitRule?.(splitContext) ?? defaultBlockSplitRule(splitContext);

  const insertEvent = insertNewBlock(document, block, newBlock, placement);

  if (areContentsEqual(blockContent, block.data.content)) {
    return insertEvent;
  }

  const updatedBlock = updateBlockContent(document, block, blockContent);

  return [
    insertEvent,
    createEvent("block:update", {
      blockId,
      newBlock: structuredClone(updatedBlock),
      childrenStrategy: "preserve",
    }),
  ];
};

const getSplitPosition = (
  offset: number,
  textLength: number,
): BlockSplitPosition => {
  if (textLength === 0) {
    return "empty";
  }

  if (offset === 0) {
    return "start";
  }

  return offset === textLength ? "end" : "middle";
};

const insertNewBlock = (
  document: EditorDocument,
  block: Block,
  newBlock: BlockPayload,
  placement: BlockSplitPlacement,
) => {
  const firstChild = getChildren(block).at(0);

  if (placement === "before" || placement === "after") {
    placement === "before"
      ? document.insertBefore(block.id, newBlock)
      : document.insertAfter(block.id, newBlock);

    return createEvent("block:insert", {
      blockId: newBlock.id,
      targetId: block.id,
      strategy: placement,
    });
  }

  if (firstChild) {
    document.insertBefore(firstChild.id, newBlock);

    return createEvent("block:insert", {
      blockId: newBlock.id,
      targetId: firstChild.id,
      strategy: "before",
    });
  }

  document.appendChild(block.id, newBlock);

  return createEvent("block:insert", {
    blockId: newBlock.id,
    targetId: block.id,
    strategy: "append",
  });
};
