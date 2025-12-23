import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockCannotContainItselfError extends EngineError<{ blockId: string }> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.BLOCK_CANNOT_CONTAIN_ITSELF,
      `A block cannot contain a child with the same ID as its own. Detected duplicate ID "${blockId}" within the subtree payload.`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isBlockCannotContainItselfError = (
  error: unknown,
): error is BlockCannotContainItselfError => {
  return error instanceof BlockCannotContainItselfError;
};
