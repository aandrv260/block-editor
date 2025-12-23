import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidBlockVariantError extends EngineError<{
  blockId: string;
  blockType: string;
}> {
  constructor(blockId: string, blockType: string) {
    super(
      DocumentErrorCode.INVALID_BLOCK_VARIANT,
      `Block type ${blockType} with ID ${blockId} has invalid properties.`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId, blockType },
    );
  }
}

export const isInvalidBlockVariantError = (
  error: unknown,
): error is InvalidBlockVariantError => {
  return error instanceof InvalidBlockVariantError;
};
