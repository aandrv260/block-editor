import type { ActionBase } from "./action-base.models";

export type RedoActionPayload = null;

export interface RedoAction extends ActionBase<"history:redo", RedoActionPayload> {}
