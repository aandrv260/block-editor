import { createMoveBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class MoveBlockCommand extends Command<"block:move"> {
  public execute(): void {
    this.document.moveBlock({
      blockId: this.payload.blockId,
      strategy: this.payload.strategy,
      targetId: this.payload.targetId,
    });

    this.history.add(this.document.toJSON());

    this.eventBus.emit(
      "block:move",
      createMoveBlockEvent({
        blockId: this.payload.blockId,
        targetId: this.payload.targetId,
        strategy: this.payload.strategy,
      }),
    );
  }
}
