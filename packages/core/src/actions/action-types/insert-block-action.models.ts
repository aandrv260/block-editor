import type { BlockPayload } from "../../document/models/document-payload.models";
import type { InsertBlockActionStrategy } from "../actions.models";
import type { ActionBase } from "./action-base.models";

export interface InsertBlockActionPayload {
  newBlock: BlockPayload;
  targetId: string;
  strategy: InsertBlockActionStrategy;
}

export interface InsertBlockAction extends ActionBase<
  "block:insert",
  InsertBlockActionPayload
> {}
