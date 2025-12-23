import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotRemoveRootError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_REMOVE_ROOT,
      "You cannot remove the root! Only its descendants.",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotRemoveRootError = (
  error: unknown,
): error is CannotRemoveRootError => {
  return error instanceof CannotRemoveRootError;
};
