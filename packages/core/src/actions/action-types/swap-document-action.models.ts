import type { ConstructableDocumentElement } from "../../document/models/document.models";
import type { ActionBase } from "./action-base.models";

export interface SwapDocumentActionPayload {
  element: ConstructableDocumentElement;
  clearHistory?: boolean;
}

export interface SwapDocumentAction extends ActionBase<
  "document:swap",
  SwapDocumentActionPayload
> {}
