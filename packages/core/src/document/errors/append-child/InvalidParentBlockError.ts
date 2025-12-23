import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidParentBlockError extends EngineError<{ parentId: string }> {
  constructor(parentId: string) {
    super(
      DocumentErrorCode.INVALID_PARENT_BLOCK,
      `Parent block with ID ${parentId} is invalid!`,
      DOCUMENT_ERROR_NAMESPACE,
      { parentId },
    );
  }
}
