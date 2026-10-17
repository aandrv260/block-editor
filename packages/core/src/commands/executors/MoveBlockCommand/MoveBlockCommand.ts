import { createMoveBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { MoveBlockEvent } from "../../../events/editor-event-bus/event-types/move-block-event.models";
import { Command } from "../Command";

export class MoveBlockCommand extends Command<"block:move"> {
  public execute(): MoveBlockEvent {
    this.document.moveBlock({
      blockId: this.payload.blockId,
      strategy: this.payload.strategy,
      targetId: this.payload.targetId,
    });

    return createMoveBlockEvent({
      blockId: this.payload.blockId,
      targetId: this.payload.targetId,
      strategy: this.payload.strategy,
    });
  }
}
