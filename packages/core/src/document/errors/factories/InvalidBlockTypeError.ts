import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidBlockTypeError extends EngineError<{
  blockId: string;
  blockType: unknown;
}> {
  constructor(blockId: string, blockType: unknown) {
    super(
      DocumentErrorCode.INVALID_BLOCK_TYPE,
      `Invalid block type ${blockType} for block ID: ${blockId}`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId, blockType },
    );
  }
}

export const isInvalidBlockTypeError = (
  error: unknown,
): error is InvalidBlockTypeError => {
  return error instanceof InvalidBlockTypeError;
};
