import type { BlockPayload } from "../../../document/models/document-payload.models";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext } from "../commandExecutors.models";

export type InsertBlockStrategy = "after" | "before" | "append";

export interface InsertBlockPayload {
  newBlock: BlockPayload;
  targetId: string;
  strategy: InsertBlockStrategy;
}

type InsertBlockCommandContext = CommandContext<InsertBlockPayload>;

export const insertBlockCommand = (context: InsertBlockCommandContext) => {
  const { payload } = context;

  payload.strategy === "append" ? appendNewBlock(context) : insertNewBlock(context);

  return createEvent("block:insert", {
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
