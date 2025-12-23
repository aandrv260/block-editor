import { createInsertBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class InsertBlockCommand extends Command<"block:insert"> {
  public execute(): void {
    this.payload.strategy === "append"
      ? this.appendNewBlock()
      : this.insertNewBlock();

    this.history.add(this.document.toJSON());

    this.eventBus.emit(
      "block:insert",
      createInsertBlockEvent({
        blockId: this.payload.newBlock.id,
        targetId: this.payload.targetId,
        strategy: this.payload.strategy,
      }),
    );
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
