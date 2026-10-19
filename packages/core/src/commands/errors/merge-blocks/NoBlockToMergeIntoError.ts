import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class NoBlockToMergeIntoError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      CommandErrorCodes.NO_BLOCK_TO_MERGE_INTO,
      "The block you're trying to merge has no block before it to merge into!",
      COMMAND_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isNoBlockToMergeIntoError = (
  error: unknown,
): error is NoBlockToMergeIntoError => {
  return error instanceof NoBlockToMergeIntoError;
};
