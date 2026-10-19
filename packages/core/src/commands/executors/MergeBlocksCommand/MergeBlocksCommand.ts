import { joinContent } from "../../../blocks/utils/content.utils";
import { getChildren } from "../../../document/utils/block-children.utils";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandEvent } from "../../../events/editor-event-bus/editorEvent.models";
import { BlockToMergeNotFoundError } from "../../errors/merge-blocks/BlockToMergeNotFoundError";
import { NoBlockToMergeIntoError } from "../../errors/merge-blocks/NoBlockToMergeIntoError";
import type { CommandContext, CommandResult } from "../commandExecutors.models";
import { updateBlockContent } from "../utils/edit-text.utils";

export interface MergeBlocksPayload {
  blockId: string;
}

export const mergeBlocksCommand = ({
  payload,
  document,
}: CommandContext<MergeBlocksPayload>): CommandResult => {
  const block = document.getBlock(payload.blockId);

  if (!block) {
    throw new BlockToMergeNotFoundError(payload.blockId);
  }

  const previousSibling = document.getPreviousSiblingBlock(block.id);
  const previousBlock = previousSibling && document.getBlock(previousSibling.id);

  if (!previousBlock) {
    throw new NoBlockToMergeIntoError(block.id);
  }

  const mergedBlock = updateBlockContent(
    document,
    previousBlock,
    joinContent(previousBlock.data.content, block.data.content),
  );

  const childIds = getChildren(block).map(child => child.id);
  const moveEvents: CommandEvent[] = [];
  let targetId = mergedBlock.id;

  for (const childId of childIds) {
    document.moveBlock({ blockId: childId, targetId, strategy: "after" });

    moveEvents.push(
      createEvent("block:move", { blockId: childId, targetId, strategy: "after" }),
    );

    targetId = childId;
  }

  document.remove(block.id);

  return [
    createEvent("block:update", {
      blockId: mergedBlock.id,
      newBlock: structuredClone(mergedBlock),
      childrenStrategy: "preserve",
    }),
    ...moveEvents,
    createEvent("block:delete", { blockId: block.id }),
  ];
};
