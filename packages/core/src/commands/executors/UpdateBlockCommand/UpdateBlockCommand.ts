import type { UpdateBlockActionPayload } from "../../../actions/action-types/update-block-action.models";
import { createUpdateBlockEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import type { UpdateBlockEvent } from "../../../events/editor-event-bus/event-types/update-block-event.models";
import type { CommandContext } from "../commandExecutors.models";

export const updateBlockCommand = ({
  payload,
  document,
}: CommandContext<UpdateBlockActionPayload>): UpdateBlockEvent => {
  document.updateBlock(payload.blockId, payload.newBlock, {
    childrenStrategy: payload.childrenStrategy,
  });

  return createUpdateBlockEvent({
    blockId: payload.blockId,
    newBlock: payload.newBlock,
    childrenStrategy: payload.childrenStrategy,
  });
};
