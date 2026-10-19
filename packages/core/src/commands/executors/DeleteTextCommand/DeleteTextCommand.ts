import { deleteTextInRange } from "../../../blocks/utils/content.utils";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext } from "../commandExecutors.models";
import { getBlockToEdit, updateBlockContent } from "../utils/edit-text.utils";

export interface DeleteTextPayload {
  blockId: string;
  from: number;
  to: number;
}

export const deleteTextCommand = ({
  payload,
  document,
}: CommandContext<DeleteTextPayload>) => {
  const block = getBlockToEdit(document, payload);

  updateBlockContent(
    document,
    block,
    deleteTextInRange(block.data.content, payload.from, payload.to),
  );

  return createEvent("text:delete", {
    blockId: payload.blockId,
    from: payload.from,
    to: payload.to,
  });
};
