import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class BlockToDeleteNotFoundError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      CommandErrorCodes.BLOCK_TO_DELETE_NOT_FOUND,
      "The block you're trying to delete does not exist!",
      COMMAND_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToDeleteNotFoundError = (
  error: unknown,
): error is BlockToDeleteNotFoundError => {
  return error instanceof BlockToDeleteNotFoundError;
};
