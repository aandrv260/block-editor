import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotPreserveChildrenOnTargetBlockError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_PRESERVE_CHILDREN_NEW_BLOCK_CANNOT_HAVE_CHILDREN,
      "You are trying to preserve the old block's children but the new block cannot have children!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotPreserveChildrenNewBlockCannotHaveChildrenError = (
  error: unknown,
): error is CannotPreserveChildrenOnTargetBlockError => {
  return error instanceof CannotPreserveChildrenOnTargetBlockError;
};
