import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ReplaceStrategyTargetCannotHaveChildrenError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_REPLACE_CHILDREN_NEW_BLOCK_CANNOT_HAVE_CHILDREN,
      "You are trying to replace the old block's children but the new block cannot have children!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotReplaceChildrenNewBlockCannotHaveChildrenError = (
  error: unknown,
): error is ReplaceStrategyTargetCannotHaveChildrenError => {
  return error instanceof ReplaceStrategyTargetCannotHaveChildrenError;
};
