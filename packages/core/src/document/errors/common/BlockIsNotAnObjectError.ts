import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class BlockIsNotAnObjectError extends EngineError<{ block: unknown }> {
  constructor(block: unknown) {
    super(
      DocumentErrorCode.BLOCK_IS_NOT_AN_OBJECT,
      "Block is not an object!",
      DOCUMENT_ERROR_NAMESPACE,
      {
        block,
      },
    );
  }
}

export const isBlockIsNotAnObjectError = (
  error: unknown,
): error is BlockIsNotAnObjectError => {
  return error instanceof BlockIsNotAnObjectError;
};
