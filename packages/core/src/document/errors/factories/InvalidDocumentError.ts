import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export interface DocumentIssue {
  path: string;
  message: string;
}

const formatIssue = ({ path, message }: DocumentIssue): string =>
  path ? `${path}: ${message}` : message;

export class InvalidDocumentError extends EngineError<{ issues: DocumentIssue[] }> {
  constructor(issues: DocumentIssue[]) {
    super(
      DocumentErrorCode.INVALID_DOCUMENT,
      `Invalid document. ${issues.map(formatIssue).join("; ")}`,
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
