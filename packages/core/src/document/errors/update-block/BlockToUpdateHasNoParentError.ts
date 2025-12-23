import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockToUpdateHasNoParentError extends EngineError<{
  blockId: string;
  parentId: string;
}> {
  constructor(blockId: string, parentId: string) {
    super(
      DocumentErrorCode.BLOCK_TO_UPDATE_HAS_NO_PARENT,
      `The block with ID ${blockId} you're trying to update does not have a parent! Parent ID: ${parentId}`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId, parentId },
    );
  }
}

export const isBlockToUpdateHasNoParentError = (
  error: unknown,
): error is BlockToUpdateHasNoParentError => {
  return error instanceof BlockToUpdateHasNoParentError;
};
