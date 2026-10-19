import { insertTextAt } from "../../../blocks/utils/content.utils";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext } from "../commandExecutors.models";
import { getBlockToEdit, updateBlockContent } from "../utils/edit-text.utils";

export interface InsertTextPayload {
  blockId: string;
  offset: number;
  text: string;
}

export const insertTextCommand = ({
  payload,
  document,
}: CommandContext<InsertTextPayload>) => {
  const block = getBlockToEdit(document, {
    blockId: payload.blockId,
    from: payload.offset,
    to: payload.offset,
  });

  updateBlockContent(
    document,
    block,
    insertTextAt(block.data.content, payload.offset, payload.text),
  );

  return createEvent("text:insert", {
    blockId: payload.blockId,
    offset: payload.offset,
    text: payload.text,
  });
};
