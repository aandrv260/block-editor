import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotUpdateRootError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_UPDATE_ROOT,
      "You cannot update document root directly!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotUpdateRootError = (
  error: unknown,
): error is CannotUpdateRootError => {
  return error instanceof CannotUpdateRootError;
};
