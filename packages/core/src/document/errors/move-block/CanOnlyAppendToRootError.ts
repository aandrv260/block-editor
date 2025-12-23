import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class CanOnlyAppendToRootError extends EngineError<void> {
  constructor() {
    super(
      DocumentErrorCode.CAN_ONLY_APPEND_TO_ROOT,
      "You can only append to the root!",
      DOCUMENT_ERROR_NAMESPACE,
    );
  }
}

export const isCanOnlyAppendToRootError = (
  error: unknown,
): error is CanOnlyAppendToRootError => {
  return error instanceof CanOnlyAppendToRootError;
};
