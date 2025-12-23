import type { BlockPayload } from "../../document/models/document-payload.models";
import type { UpdateBlockChildrenStrategy } from "../../document/models/document.models";
import type { ActionBase } from "./action-base.models";

export interface UpdateBlockActionPayload {
  blockId: string;
  newBlock: BlockPayload;
  childrenStrategy: UpdateBlockChildrenStrategy;
}

export interface UpdateBlockAction extends ActionBase<
  "block:update",
  UpdateBlockActionPayload
> {}
