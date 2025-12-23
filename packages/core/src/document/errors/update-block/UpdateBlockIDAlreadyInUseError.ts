import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class UpdateBlockIDAlreadyInUseError extends EngineError<{
  blockId: string;
}> {
  constructor(blockId: string) {
    super(
      DocumentErrorCode.UPDATE_BLOCK_ID_ALREADY_IN_USE,
      `The ID of the new block you passed \`${blockId}\` is already in use by another block in the document. You can only pass an existing ID if it's the same as the target block's ID. Please change the ID.`,
      DOCUMENT_ERROR_NAMESPACE,
      { blockId },
    );
  }
}

export const isUpdateBlockIDAlreadyInUseError = (
  error: unknown,
): error is UpdateBlockIDAlreadyInUseError => {
  return error instanceof UpdateBlockIDAlreadyInUseError;
};
