import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidDocumentRootIDError extends EngineError<{ rootId: unknown }> {
  constructor(rootId: unknown) {
    super(
      DocumentErrorCode.INVALID_DOCUMENT_ROOT_ID,
      `Invalid root ID detected: ${rootId}`,
      DOCUMENT_ERROR_NAMESPACE,
      { rootId },
    );
  }
}

export const isInvalidDocumentRootIDError = (
  error: unknown,
): error is InvalidDocumentRootIDError => {
  return error instanceof InvalidDocumentRootIDError;
};
