import { createDocumentSwapEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class SwapDocumentCommand extends Command<"document:swap"> {
  public execute(): void {
    const { element, clearHistory } = this.payload;
    this.document.swap(element);

    if (clearHistory) {
      this.history.clear();
    }

    this.history.add(this.document.toJSON());

    this.eventBus.emit(
      "document:swap",
      createDocumentSwapEvent({
        element: this.payload.element,
        historyCleared: this.payload.clearHistory,
      }),
    );
  }
}
