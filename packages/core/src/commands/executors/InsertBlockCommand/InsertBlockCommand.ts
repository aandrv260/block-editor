import { createInsertBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { InsertBlockEvent } from "../../../events/editor-event-bus/event-types/insert-block-event.models";
import { Command } from "../Command";

export class InsertBlockCommand extends Command<"block:insert"> {
  public execute(): InsertBlockEvent {
    this.payload.strategy === "append"
      ? this.appendNewBlock()
      : this.insertNewBlock();

    return createInsertBlockEvent({
      blockId: this.payload.newBlock.id,
      targetId: this.payload.targetId,
      strategy: this.payload.strategy,
    });
  }

  private insertNewBlock() {
    const { newBlock, strategy, targetId } = this.payload;

    strategy === "after"
      ? this.document.insertAfter(targetId, newBlock)
      : this.document.insertBefore(targetId, newBlock);
  }

  private appendNewBlock() {
    const { newBlock, targetId } = this.payload;

    this.document.appendChild(targetId, newBlock);
  }
}
