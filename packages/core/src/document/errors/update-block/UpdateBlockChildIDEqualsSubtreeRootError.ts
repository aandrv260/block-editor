import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ChildBlockIdConflictsWithSubtreeRootError extends EngineError<{
  childId: string;
  subtreeRootId: string;
}> {
  constructor(childId: string, subtreeRootId: string) {
    super(
      DocumentErrorCode.UPDATE_BLOCK_CHILD_ID_EQUALS_SUBTREE_ROOT,
      `Child block with ID \`${childId}\` you are trying to insert is the same as the ID of the root of this subtree. This is an illegal operation as all IDs in the document must be unique!`,
      DOCUMENT_ERROR_NAMESPACE,
      { childId, subtreeRootId },
    );
  }
}

export const isUpdateBlockChildIDEqualsSubtreeRootError = (
  error: unknown,
): error is ChildBlockIdConflictsWithSubtreeRootError => {
  return error instanceof ChildBlockIdConflictsWithSubtreeRootError;
};
