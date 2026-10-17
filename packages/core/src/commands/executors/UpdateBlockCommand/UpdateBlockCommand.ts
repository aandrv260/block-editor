import { createUpdateBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { UpdateBlockEvent } from "../../../events/editor-event-bus/event-types/update-block-event.models";
import { Command } from "../Command";

export class UpdateBlockCommand extends Command<"block:update"> {
  public execute(): UpdateBlockEvent {
    this.document.updateBlock(this.payload.blockId, this.payload.newBlock, {
      childrenStrategy: this.payload.childrenStrategy,
    });

    return createUpdateBlockEvent({
      blockId: this.payload.blockId,
      newBlock: this.payload.newBlock,
      childrenStrategy: this.payload.childrenStrategy,
    });
  }
}
