import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class TargetBlockCannotHaveChildrenError extends EngineError<{
  targetId: string;
}> {
  constructor(targetId: string) {
    super(
      DocumentErrorCode.TARGET_BLOCK_CANNOT_HAVE_CHILDREN,
      "The target block cannot have children!",
      DOCUMENT_ERROR_NAMESPACE,
      { targetId },
    );
  }
}

export const isTargetBlockCannotHaveChildrenError = (
  error: unknown,
): error is TargetBlockCannotHaveChildrenError => {
  return error instanceof TargetBlockCannotHaveChildrenError;
};
