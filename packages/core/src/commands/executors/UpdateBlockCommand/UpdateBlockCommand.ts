import { createUpdateBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class UpdateBlockCommand extends Command<"block:update"> {
  public execute(): void {
    this.document.updateBlock(this.payload.blockId, this.payload.newBlock, {
      childrenStrategy: this.payload.childrenStrategy,
    });

    this.history.add(this.document.toJSON());

    this.eventBus.emit(
      "block:update",
      createUpdateBlockEvent({
        blockId: this.payload.blockId,
        newBlock: this.payload.newBlock,
        childrenStrategy: this.payload.childrenStrategy,
      }),
    );
  }
}
