import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockAlreadyExistsError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_ALREADY_EXISTS,
      `Block with ID ${blockId} already exists in the document.`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockAlreadyExistsError = (
  error: unknown,
): error is BlockAlreadyExistsError => {
  return error instanceof BlockAlreadyExistsError;
};
