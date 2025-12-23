import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotMoveBlockToItselfError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_MOVE_BLOCK_TO_ITSELF,
      "You cannot move a block to itself!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotMoveBlockToItselfError = (
  error: unknown,
): error is CannotMoveBlockToItselfError => {
  return error instanceof CannotMoveBlockToItselfError;
};
