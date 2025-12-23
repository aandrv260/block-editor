import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockToUpdateNotFoundError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_TO_UPDATE_NOT_FOUND,
      "The blockID you passed does not map to any id of a block currently in the document!",
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToUpdateNotFoundError = (
  error: unknown,
): error is BlockToUpdateNotFoundError => {
  return error instanceof BlockToUpdateNotFoundError;
};
