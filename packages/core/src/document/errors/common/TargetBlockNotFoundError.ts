import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class TargetBlockNotFoundError extends EngineError<{ targetId: string }> {
  constructor(targetId: string) {
    super(
      DocumentErrorCode.TARGET_BLOCK_NOT_FOUND,
      `Target not found with the specified targetId \`${targetId}\`!`,
      DOCUMENT_ERROR_NAMESPACE,
      { targetId },
    );
  }
}

export const isTargetBlockNotFoundError = (
  error: unknown,
): error is TargetBlockNotFoundError => {
  return error instanceof TargetBlockNotFoundError;
};
