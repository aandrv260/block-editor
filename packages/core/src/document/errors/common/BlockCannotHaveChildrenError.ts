import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockCannotHaveChildrenError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_CANNOT_HAVE_CHILDREN,
      `Block with ID ${blockId} cannot have children!`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockCannotHaveChildrenError = (
  error: unknown,
): error is BlockCannotHaveChildrenError => {
  return error instanceof BlockCannotHaveChildrenError;
};
