import type { BlockPayload } from "../../../document/models/document-payload.models";
import type { UpdateBlockChildrenStrategy } from "../../../document/models/document.models";

export interface UpdateBlockEvent {
  type: "block:update";
  blockId: string;
  childrenStrategy: UpdateBlockChildrenStrategy;
  newBlock: BlockPayload;
}
