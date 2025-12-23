import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotMoveBlockToDescendantError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_MOVE_BLOCK_TO_DESCENDANT,
      "You cannot move a block to a descendant of itself!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotMoveBlockToDescendantError = (
  error: unknown,
): error is CannotMoveBlockToDescendantError => {
  return error instanceof CannotMoveBlockToDescendantError;
};
