import { DOCUMENT_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { DocumentErrorCode } from "../DocumentErrorCode";

export class InvalidMoveStrategyError extends EngineError<{ strategy: unknown }> {
  constructor(strategy: unknown) {
    super(
      DocumentErrorCode.INVALID_MOVE_STRATEGY,
      `Invalid strategy: \`${strategy}\``,
      DOCUMENT_ERROR_NAMESPACE,
      { strategy },
    );
  }
}

export const isInvalidMoveStrategyError = (
  error: unknown,
): error is InvalidMoveStrategyError => {
  return error instanceof InvalidMoveStrategyError;
};
