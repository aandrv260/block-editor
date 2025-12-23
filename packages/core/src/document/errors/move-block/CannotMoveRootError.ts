import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotMoveRootError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_MOVE_ROOT,
      "You cannot move the root! Only its descendants.",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotMoveRootError = (
  error: unknown,
): error is CannotMoveRootError => {
  return error instanceof CannotMoveRootError;
};
