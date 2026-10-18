import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";
import { formatIssues, type DocumentIssue } from "../common/DocumentIssue";

export class InvalidDocumentError extends EngineError<{ issues: DocumentIssue[] }> {
  constructor(issues: DocumentIssue[]) {
    super(
      DocumentErrorCode.INVALID_DOCUMENT,
      `Invalid document. ${formatIssues(issues)}`,
      DOCUMENT_ERROR_NAMESPACE,
      { issues },
    );
  }
}

export const isInvalidDocumentError = (
  error: unknown,
): error is InvalidDocumentError => {
  return error instanceof InvalidDocumentError;
};
