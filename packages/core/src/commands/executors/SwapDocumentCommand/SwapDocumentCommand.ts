import type { SwapDocumentActionPayload } from "../../../actions/action-types/swap-document-action.models";
import { createDocumentSwapEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { DocumentSwapEvent } from "../../../events/editor-event-bus/event-types/document-swap-event.models";
import type { CommandContext } from "../commandExecutors.models";

/**
 * Only swaps the document. The command center clears the history when the `clearHistory` flag is set.
 */
export const swapDocumentCommand = ({
  payload,
  document,
}: CommandContext<SwapDocumentActionPayload>): DocumentSwapEvent => {
  document.swap(payload.element);

  return createDocumentSwapEvent({
    element: payload.element,
    historyCleared: payload.clearHistory,
  });
};
