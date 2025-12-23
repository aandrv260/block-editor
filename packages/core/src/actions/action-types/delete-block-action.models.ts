import type { ActionBase } from "./action-base.models";

export interface DeleteBlockActionPayload {
  blockId: string;
}

export interface DeleteBlockAction extends ActionBase<
  "block:delete",
  DeleteBlockActionPayload
> {}
