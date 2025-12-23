import { createHistoryJumpEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class HistoryJumpCommand extends Command<"history:jump"> {
  public execute(): void {
    const currentDocumentJSON = this.history.jumpTo(this.payload.index);

    if (!currentDocumentJSON) {
      return;
    }

    this.document.swap(currentDocumentJSON);
    this.eventBus.emit(
      "history:jump",
      createHistoryJumpEvent({ index: this.payload.index }),
    );
  }
}
