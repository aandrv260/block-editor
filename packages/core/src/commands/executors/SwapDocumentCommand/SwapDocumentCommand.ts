import type { ConstructableDocumentElement } from "../../../document/models/document.models";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
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
}: CommandContext<SwapDocumentPayload>) => {
  document.swap(payload.element);

  return createEvent("document:swap", {
    element: payload.element,
    historyCleared: payload.clearHistory ?? false,
  });
};
