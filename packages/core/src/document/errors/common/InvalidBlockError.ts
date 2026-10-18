import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";
import { formatIssues, type DocumentIssue } from "./DocumentIssue";

export class InvalidBlockError extends EngineError<{ issues: DocumentIssue[] }> {
  constructor(issues: DocumentIssue[]) {
    super(
      DocumentErrorCode.INVALID_BLOCK,
      `Invalid block. ${formatIssues(issues)}`,
      DOCUMENT_ERROR_NAMESPACE,
      { issues },
    );
  }
}

export const isInvalidBlockError = (error: unknown): error is InvalidBlockError => {
  return error instanceof InvalidBlockError;
};
