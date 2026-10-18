import type { MoveBlockStrategy } from "../../../document/models/document.models";
import { createMoveBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { MoveBlockEvent } from "../../../events/editor-event-bus/event-types/move-block-event.models";
import type { CommandContext } from "../commandExecutors.models";

export interface MoveBlockPayload {
  blockId: string;
  targetId: string;
  strategy: MoveBlockStrategy;
}

export const moveBlockCommand = ({
  payload,
  document,
}: CommandContext<MoveBlockPayload>): MoveBlockEvent => {
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
