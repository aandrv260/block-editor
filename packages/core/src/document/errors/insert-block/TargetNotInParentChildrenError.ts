import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class TargetNotInParentChildrenError extends EngineError<{
  targetId: string;
  parentId: string;
}> {
  constructor(targetId: string, parentId: string) {
    super(
      DocumentErrorCode.TARGET_NOT_IN_PARENT_CHILDREN,
      `Target with ID "${targetId}" not found among its parent's children. Parent ID: "${parentId}"`,
      DOCUMENT_ERROR_NAMESPACE,
      { targetId, parentId },
    );
  }
}

export const isTargetNotInParentChildrenError = (
  error: unknown,
): error is TargetNotInParentChildrenError => {
  return error instanceof TargetNotInParentChildrenError;
};
