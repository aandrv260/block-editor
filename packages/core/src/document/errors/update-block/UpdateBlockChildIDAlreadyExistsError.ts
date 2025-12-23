import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ChildBlockIdAlreadyExistsError extends EngineError<{
  childId: string;
}> {
  constructor(childId: string) {
    super(
      DocumentErrorCode.UPDATE_BLOCK_CHILD_ID_ALREADY_EXISTS,
      `You are trying to insert a child with ID \`${childId}\`when updating the block. Another block with this ID already exists in the document!`,
      DOCUMENT_ERROR_NAMESPACE,
      { childId },
    );
  }
}

export const isUpdateBlockChildIDAlreadyExistsError = (
  error: unknown,
): error is ChildBlockIdAlreadyExistsError => {
  return error instanceof ChildBlockIdAlreadyExistsError;
};
