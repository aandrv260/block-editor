import type { InsertBlockActionPayload } from "../../../actions/action-types/insert-block-action.models";
import { createInsertBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { InsertBlockEvent } from "../../../events/editor-event-bus/event-types/insert-block-event.models";
import type { CommandContext } from "../commandExecutors.models";

type InsertBlockCommandContext = CommandContext<InsertBlockActionPayload>;

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
