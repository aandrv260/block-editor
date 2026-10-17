import { createDocumentSwapEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { DocumentSwapEvent } from "../../../events/editor-event-bus/event-types/document-swap-event.models";
import { Command } from "../Command";

export class SwapDocumentCommand extends Command<"document:swap"> {
  /**
   * Only swaps the document. The command center clears the history when the `clearHistory` flag is set.
   */
  public execute(): DocumentSwapEvent {
    this.document.swap(this.payload.element);

    return createDocumentSwapEvent({
      element: this.payload.element,
      historyCleared: this.payload.clearHistory,
    });
  }
}
