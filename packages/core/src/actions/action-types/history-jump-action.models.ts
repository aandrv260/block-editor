import type { ActionBase } from "./action-base.models";

export interface HistoryJumpActionPayload {
  index: number;
}

export interface HistoryJumpAction extends ActionBase<
  "history:jump",
  HistoryJumpActionPayload
> {}
