import type { BlockPayload } from "../../../document/models/document-payload.models";
import type { UpdateBlockChildrenStrategy } from "../../../document/models/document.models";
import { createUpdateBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { UpdateBlockEvent } from "../../../events/editor-event-bus/event-types/update-block-event.models";
import type { CommandContext } from "../commandExecutors.models";

export interface UpdateBlockPayload {
  blockId: string;
  newBlock: BlockPayload;
  childrenStrategy: UpdateBlockChildrenStrategy;
}

export const updateBlockCommand = ({
  payload,
  document,
}: CommandContext<UpdateBlockPayload>): UpdateBlockEvent => {
  document.updateBlock(payload.blockId, payload.newBlock, {
    childrenStrategy: payload.childrenStrategy,
  });

  return createUpdateBlockEvent({
    blockId: payload.blockId,
    newBlock: payload.newBlock,
    childrenStrategy: payload.childrenStrategy,
  });
};
