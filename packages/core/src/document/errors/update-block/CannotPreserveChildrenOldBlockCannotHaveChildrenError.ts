import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CannotPreserveFromChildlessSourceBlockError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_PRESERVE_CHILDREN_OLD_BLOCK_CANNOT_HAVE_CHILDREN,
      "You are trying to preserve the old block's children when the old block cannot have children and the new block can. This is an invalid operation. Please consider using `replace` strategy instead!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotPreserveChildrenOldBlockCannotHaveChildrenError = (
  error: unknown,
): error is CannotPreserveFromChildlessSourceBlockError => {
  return error instanceof CannotPreserveFromChildlessSourceBlockError;
};
