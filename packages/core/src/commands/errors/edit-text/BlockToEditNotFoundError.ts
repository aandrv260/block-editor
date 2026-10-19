import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class BlockToEditNotFoundError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      CommandErrorCodes.BLOCK_TO_EDIT_NOT_FOUND,
      "The block whose text you're trying to edit does not exist!",
      COMMAND_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToEditNotFoundError = (
  error: unknown,
): error is BlockToEditNotFoundError => {
  return error instanceof BlockToEditNotFoundError;
};
