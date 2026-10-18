import type { BlockPayload } from "../../../document/models/document-payload.models";
import { createInsertBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { InsertBlockEvent } from "../../../events/editor-event-bus/event-types/insert-block-event.models";
import type { CommandContext } from "../commandExecutors.models";

export type InsertBlockStrategy = "after" | "before" | "append";

export interface InsertBlockPayload {
  newBlock: BlockPayload;
  targetId: string;
  strategy: InsertBlockStrategy;
}

type InsertBlockCommandContext = CommandContext<InsertBlockPayload>;

export const insertBlockCommand = (
  context: InsertBlockCommandContext,
): InsertBlockEvent => {
  const { payload } = context;

  payload.strategy === "append" ? appendNewBlock(context) : insertNewBlock(context);

  return createInsertBlockEvent({
    blockId: payload.newBlock.id,
    targetId: payload.targetId,
    strategy: payload.strategy,
  });
};

const insertNewBlock = ({ payload, document }: InsertBlockCommandContext) => {
  const { newBlock, strategy, targetId } = payload;

  strategy === "after"
    ? document.insertAfter(targetId, newBlock)
    : document.insertBefore(targetId, newBlock);
};

const appendNewBlock = ({ payload, document }: InsertBlockCommandContext) => {
  const { newBlock, targetId } = payload;

  document.appendChild(targetId, newBlock);
};
