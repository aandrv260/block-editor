import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class BlockToMergeNotFoundError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      CommandErrorCodes.BLOCK_TO_MERGE_NOT_FOUND,
      "The block you're trying to merge does not exist!",
      COMMAND_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToMergeNotFoundError = (
  error: unknown,
): error is BlockToMergeNotFoundError => {
  return error instanceof BlockToMergeNotFoundError;
};
