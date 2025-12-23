import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ReplaceStrategyMissingNewChildrenError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CANNOT_REPLACE_CHILDREN_NO_CHILDREN_PROVIDED,
      "You are trying to replace the old block's children but you did not pass new children!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCannotReplaceChildrenNoChildrenProvidedError = (
  error: unknown,
): error is ReplaceStrategyMissingNewChildrenError => {
  return error instanceof ReplaceStrategyMissingNewChildrenError;
};
