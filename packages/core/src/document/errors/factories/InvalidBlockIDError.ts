import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidBlockIDError extends EngineError<{
  parentId: string;
  blockId: unknown;
}> {
  constructor(parentId: string, blockId: unknown) {
    super(
      DocumentErrorCode.INVALID_BLOCK_ID,
      `Missing or invalid block ID for block with parent ID: ${parentId}. ID must always be a string!`,
      DOCUMENT_ERROR_NAMESPACE,
      { parentId, blockId },
    );
  }
}

export const isInvalidBlockIDError = (
  error: unknown,
): error is InvalidBlockIDError => {
  return error instanceof InvalidBlockIDError;
};
