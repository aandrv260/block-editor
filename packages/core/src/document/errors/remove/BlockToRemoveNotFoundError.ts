import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockToRemoveNotFoundError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_TO_REMOVE_NOT_FOUND,
      "The block you're trying to remove does not exist!",
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToRemoveNotFoundError = (
  error: unknown,
): error is BlockToRemoveNotFoundError => {
  return error instanceof BlockToRemoveNotFoundError;
};
