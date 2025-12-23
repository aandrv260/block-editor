import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidBlockParentIDError extends EngineError<{
  parentId: unknown;
  blockId: string;
}> {
  constructor(parentId: unknown, blockId: string) {
    super(
      DocumentErrorCode.INVALID_BLOCK_PARENT_ID,
      `Missing or invalid parentId for block ID: ${blockId}. Parent ID must always be a string!`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId, parentId },
    );
  }
}

export const isInvalidBlockParentIDError = (
  error: unknown,
): error is InvalidBlockParentIDError => {
  return error instanceof InvalidBlockParentIDError;
};
