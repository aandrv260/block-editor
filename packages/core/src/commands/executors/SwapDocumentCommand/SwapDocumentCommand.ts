import type { ConstructableDocumentElement } from "../../../document/models/document.models";
import { createDocumentSwapEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { DocumentSwapEvent } from "../../../events/editor-event-bus/event-types/document-swap-event.models";
import type { CommandContext } from "../commandExecutors.models";

export interface SwapDocumentPayload {
  element: ConstructableDocumentElement;
  clearHistory?: boolean;
}

/**
 * Only swaps the document. The command center clears the history when the `clearHistory` flag is set.
 */
export const swapDocumentCommand = ({
  payload,
  document,
}: CommandContext<SwapDocumentPayload>): DocumentSwapEvent => {
  document.swap(payload.element);

  return createDocumentSwapEvent({
    element: payload.element,
    historyCleared: payload.clearHistory ?? false,
  });
};
