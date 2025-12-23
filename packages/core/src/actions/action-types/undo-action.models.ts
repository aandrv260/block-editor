import type { ActionBase } from "./action-base.models";

export type UndoActionPayload = null;

export interface UndoAction extends ActionBase<"history:undo", UndoActionPayload> {}
