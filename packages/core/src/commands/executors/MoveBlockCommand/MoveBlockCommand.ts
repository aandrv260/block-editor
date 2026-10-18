import type { MoveBlockStrategy } from "../../../document/models/document.models";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext } from "../commandExecutors.models";

export interface MoveBlockPayload {
  blockId: string;
  targetId: string;
  strategy: MoveBlockStrategy;
}

export const moveBlockCommand = ({
  payload,
  document,
}: CommandContext<MoveBlockPayload>) => {
  document.moveBlock({
    blockId: payload.blockId,
    strategy: payload.strategy,
    targetId: payload.targetId,
  });

  return createEvent("block:move", {
    blockId: payload.blockId,
    targetId: payload.targetId,
    strategy: payload.strategy,
  });
};
