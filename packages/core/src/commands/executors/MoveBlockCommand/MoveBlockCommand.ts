import type { MoveBlockActionPayload } from "../../../actions/action-types/move-block-action.models";
import { createMoveBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { MoveBlockEvent } from "../../../events/editor-event-bus/event-types/move-block-event.models";
import type { CommandContext } from "../commandExecutors.models";

export const moveBlockCommand = ({
  payload,
  document,
}: CommandContext<MoveBlockActionPayload>): MoveBlockEvent => {
  document.moveBlock({
    blockId: payload.blockId,
    strategy: payload.strategy,
    targetId: payload.targetId,
  });

  return createMoveBlockEvent({
    blockId: payload.blockId,
    targetId: payload.targetId,
    strategy: payload.strategy,
  });
};
