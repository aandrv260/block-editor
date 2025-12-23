import type { Nullish } from "@/common/types/utility.types";
import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ParentBlockNotFoundError extends EngineError<{
  parentId: Nullish<string>;
  blockId: Nullish<string>;
}> {
  constructor(parentId: Nullish<string>, blockId: Nullish<string>) {
    super(
      DocumentErrorCode.PARENT_BLOCK_NOT_FOUND,
      `Parent with ID "${parentId}" not found for block "${blockId}".`,
      DOCUMENT_ERROR_NAMESPACE,
      { parentId, blockId },
    );
  }
}

export const isParentBlockNotFoundError = (
  error: unknown,
): error is ParentBlockNotFoundError => {
  return error instanceof ParentBlockNotFoundError;
};
