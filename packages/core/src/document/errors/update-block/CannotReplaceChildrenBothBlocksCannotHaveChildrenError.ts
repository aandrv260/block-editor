import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ReplaceStrategyNotApplicableError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_REPLACE_CHILDREN_BOTH_BLOCKS_CANNOT_HAVE_CHILDREN,
      "The current and the new block cannot have children so you cannot use the replace strategy!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotReplaceChildrenBothBlocksCannotHaveChildrenError = (
  error: unknown,
): error is ReplaceStrategyNotApplicableError => {
  return error instanceof ReplaceStrategyNotApplicableError;
};
