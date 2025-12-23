import type { ConstructableDocumentElement } from "../../../document/models/document.models";

export interface DocumentSwapEvent {
  type: "document:swap";
  element: ConstructableDocumentElement;
  historyCleared?: boolean;
}
