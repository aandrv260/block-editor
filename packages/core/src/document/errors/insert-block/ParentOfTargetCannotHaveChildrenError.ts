import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ParentOfTargetCannotHaveChildrenError extends EngineError<{
  parentId: string;
  targetId: string;
}> {
  constructor(parentId: string, targetId: string) {
    super(
      DocumentErrorCode.PARENT_OF_TARGET_CANNOT_HAVE_CHILDREN,
      `Parent with ID "${parentId}" of target with ID "${targetId}" cannot have children!`,
      DOCUMENT_ERROR_NAMESPACE,
      { parentId, targetId },
    );
  }
}

export const isParentOfTargetCannotHaveChildrenError = (
  error: unknown,
): error is ParentOfTargetCannotHaveChildrenError => {
  return error instanceof ParentOfTargetCannotHaveChildrenError;
};
