import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ReplaceStrategySourceHasNoChildrenError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_REPLACE_CHILDREN_OLD_BLOCK_CANNOT_HAVE_CHILDREN,
      "The current block cannot have children but the new block can. This is illegal operation.",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotReplaceChildrenOldBlockCannotHaveChildrenError = (
  error: unknown,
): error is ReplaceStrategySourceHasNoChildrenError => {
  return error instanceof ReplaceStrategySourceHasNoChildrenError;
};
