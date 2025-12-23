import { HISTORY_ERROR_NAMESPACE, EngineError } from "../../errors/EngineError";
import { HistoryErrorCodes } from "./HistoryErrorCodes";

export class HistoryIndexOutOfRangeError extends EngineError<{ index: number }> {
  constructor(index: number) {
    super(
      HistoryErrorCodes.HISTORY_INDEX_OUT_OF_RANGE,
      "Index out of range",
      HISTORY_ERROR_NAMESPACE,
      { index },
    );
  }
}

export const isHistoryIndexOutOfRangeError = (
  error: unknown,
): error is HistoryIndexOutOfRangeError => {
  return error instanceof HistoryIndexOutOfRangeError;
};
