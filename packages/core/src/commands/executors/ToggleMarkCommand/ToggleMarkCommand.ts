import type { Mark } from "../../../blocks/models/content/marks/mark.models";
import {
  addMark,
  hasMarkInRange,
  removeMark,
} from "../../../blocks/utils/content.utils";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import type { CommandContext } from "../commandExecutors.models";
import { getBlockToEdit, updateBlockContent } from "../utils/edit-text.utils";

export interface ToggleMarkPayload {
  blockId: string;
  from: number;
  to: number;
  mark: Mark;
}

export const toggleMarkCommand = ({
  payload,
  document,
}: CommandContext<ToggleMarkPayload>) => {
  const { blockId, from, to, mark } = payload;
  const block = getBlockToEdit(document, payload);
  const { content } = block.data;

  if (hasMarkInRange(content, from, to, mark)) {
    updateBlockContent(document, block, removeMark(content, from, to, mark.type));
    return createEvent("mark:remove", { blockId, from, to, mark });
  }

  updateBlockContent(document, block, addMark(content, from, to, mark));
  return createEvent("mark:add", { blockId, from, to, mark });
};
