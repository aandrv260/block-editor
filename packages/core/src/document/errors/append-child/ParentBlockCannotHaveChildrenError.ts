import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class ParentBlockCannotHaveChildrenError extends EngineError<{
  parentId: string;
}> {
  constructor(parentId: string) {
    super(
      DocumentErrorCode.PARENT_BLOCK_CANNOT_HAVE_CHILDREN,
      `Parent block with ID ${parentId} cannot have children!`,
      DOCUMENT_ERROR_NAMESPACE,
      { parentId },
    );
  }
}
