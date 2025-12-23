import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ParentOfBlockHasNoChildrenError extends EngineError<{
  parentId: string;
  blockId: string;
}> {
  constructor(parentId: string, blockId: string) {
    super(
      DocumentErrorCode.PARENT_OF_BLOCK_HAS_NO_CHILDREN,
      `Parent with ID "${parentId}" of block with ID "${blockId}" does not have any children!`,
      DOCUMENT_ERROR_NAMESPACE,
      { parentId, blockId },
    );
  }
}

export const isParentOfBlockHasNoChildrenError = (
  error: unknown,
): error is ParentOfBlockHasNoChildrenError => {
  return error instanceof ParentOfBlockHasNoChildrenError;
};
