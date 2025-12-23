import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockToMoveNotFoundError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_TO_MOVE_NOT_FOUND,
      `Block with ID ${blockId} not found in the document!`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockToMoveNotFoundError = (
  error: unknown,
): error is BlockToMoveNotFoundError => {
  return error instanceof BlockToMoveNotFoundError;
};
