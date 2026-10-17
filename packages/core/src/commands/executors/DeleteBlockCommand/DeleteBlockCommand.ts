import type { Block } from "../../../blocks/models/block.models";
import { createDeleteBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { DeleteBlockEvent } from "../../../events/editor-event-bus/event-types/delete-block-event.models";
import { BlockToDeleteNotFoundError } from "../../errors/delete-block/BlockToDeleteNotFoundError";
import { Command } from "../Command";

export class DeleteBlockCommand extends Command<"block:delete"> {
  public execute(): DeleteBlockEvent {
    this.validateBlockToDeleteExists();
    this.document.remove(this.payload.blockId);

    return createDeleteBlockEvent({ blockId: this.payload.blockId });
  }

  private validateBlockToDeleteExists(): Block {
    const blockToDelete = this.document.getBlock(this.payload.blockId);

    if (!blockToDelete) {
      throw new BlockToDeleteNotFoundError(this.payload.blockId);
    }

    return blockToDelete;
  }
}
