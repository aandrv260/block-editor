import { HISTORY_ERROR_NAMESPACE, EngineError } from "../../errors/EngineError";
import { HistoryErrorCodes } from "./HistoryErrorCodes";

export class InvalidHistoryLimitError extends EngineError<{ limit: number }> {
  constructor(limit: number) {
    super(
      HistoryErrorCodes.INVALID_HISTORY_LIMIT,
      "Limit must be greater than 0!",
      HISTORY_ERROR_NAMESPACE,
      { limit },
    );
  }
}

export const isInvalidHistoryLimitError = (
  error: unknown,
): error is InvalidHistoryLimitError => {
  return error instanceof InvalidHistoryLimitError;
};
