import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class DuplicateOrCircularBlockError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.DUPLICATE_OR_CIRCULAR_BLOCK,
      `Duplicate or circular block ID detected: ${blockId}`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isDuplicateOrCircularBlockError = (
  error: unknown,
): error is DuplicateOrCircularBlockError => {
  return error instanceof DuplicateOrCircularBlockError;
};
