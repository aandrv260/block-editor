import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockToRemoveHasNoParentError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_TO_REMOVE_HAS_NO_PARENT,
      "The block you're trying to remove does not have a parent!",
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToRemoveHasNoParentError = (
  error: unknown,
): error is BlockToRemoveHasNoParentError => {
  return error instanceof BlockToRemoveHasNoParentError;
};
