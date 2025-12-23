import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidDocumentJSONError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.INVALID_DOCUMENT_JSON,
      "Invalid JSON format — cannot parse document.",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isInvalidDocumentJSONError = (
  error: unknown,
): error is InvalidDocumentJSONError => {
  return error instanceof InvalidDocumentJSONError;
};
