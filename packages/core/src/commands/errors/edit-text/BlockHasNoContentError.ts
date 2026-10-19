import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class BlockHasNoContentError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      CommandErrorCodes.BLOCK_HAS_NO_CONTENT,
      "The block you're trying to edit has no text!",
      COMMAND_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockHasNoContentError = (
  error: unknown,
): error is BlockHasNoContentError => {
  return error instanceof BlockHasNoContentError;
};
