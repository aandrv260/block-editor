import type { BlockPayload } from "../../../document/models/document-payload.models";
import type { UpdateBlockChildrenStrategy } from "../../../document/models/document.models";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext } from "../commandExecutors.models";

export interface UpdateBlockPayload {
  blockId: string;
  newBlock: BlockPayload;
  childrenStrategy: UpdateBlockChildrenStrategy;
}

export const updateBlockCommand = ({
  payload,
  document,
}: CommandContext<UpdateBlockPayload>) => {
  document.updateBlock(payload.blockId, payload.newBlock, {
    childrenStrategy: payload.childrenStrategy,
  });

  return createEvent("block:update", {
    blockId: payload.blockId,
    newBlock: payload.newBlock,
    childrenStrategy: payload.childrenStrategy,
  });
};
