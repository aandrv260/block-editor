import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotInsertBeforeRootError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_INSERT_BEFORE_ROOT,
      "You cannot insert before the root!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotInsertBeforeRootError = (
  error: unknown,
): error is CannotInsertBeforeRootError => {
  return error instanceof CannotInsertBeforeRootError;
};
