import type { Block } from "../../../blocks/models/block.models";
import { createEvent } from "../../../events/editor-event-bus/createEvent";
import { BlockToDeleteNotFoundError } from "../../errors/delete-block/BlockToDeleteNotFoundError";
import type { CommandContext } from "../commandExecutors.models";

export interface DeleteBlockPayload {
  blockId: string;
}

type DeleteBlockCommandContext = CommandContext<DeleteBlockPayload>;

export const deleteBlockCommand = (context: DeleteBlockCommandContext) => {
  const { payload, document } = context;

  validateBlockToDeleteExists(context);
  document.remove(payload.blockId);

  return createEvent("block:delete", { blockId: payload.blockId });
};

const validateBlockToDeleteExists = ({
  payload,
  document,
}: DeleteBlockCommandContext): Block => {
  const blockToDelete = document.getBlock(payload.blockId);

  if (!blockToDelete) {
    throw new BlockToDeleteNotFoundError(payload.blockId);
  }

  return blockToDelete;
};
