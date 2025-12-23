import type { ActionBase } from "./action-base.models";

export interface HistorySetActionPayload {
  history: readonly string[];
}

export interface HistorySetAction extends ActionBase<
  "history:set",
  HistorySetActionPayload
> {}
