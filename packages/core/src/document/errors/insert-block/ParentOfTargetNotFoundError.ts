import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ParentOfTargetNotFoundError extends EngineError<{ targetId: string }> {
  constructor(targetId: string) {
    super(
      DocumentErrorCode.PARENT_OF_TARGET_NOT_FOUND,
      "Parent of target does not exist!",
      DOCUMENT_ERROR_NAMESPACE,
      { targetId },
    );
  }
}

export const isParentOfTargetNotFoundError = (
  error: unknown,
): error is ParentOfTargetNotFoundError => {
  return error instanceof ParentOfTargetNotFoundError;
};
