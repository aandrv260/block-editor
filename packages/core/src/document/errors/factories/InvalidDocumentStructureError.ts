import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidDocumentStructureError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.INVALID_DOCUMENT_STRUCTURE,
      "Invalid document structure — root block missing or incorrect.",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isInvalidDocumentStructureError = (
  error: unknown,
): error is InvalidDocumentStructureError => {
  return error instanceof InvalidDocumentStructureError;
};
