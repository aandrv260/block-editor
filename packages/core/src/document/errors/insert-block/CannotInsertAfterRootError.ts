import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotInsertAfterRootError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_INSERT_AFTER_ROOT,
      "You cannot insert after the root!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotInsertAfterRootError = (
  error: unknown,
): error is CannotInsertAfterRootError => {
  return error instanceof CannotInsertAfterRootError;
};
