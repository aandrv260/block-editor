import { HISTORY_ERROR_NAMESPACE, EngineError } from "../../errors/EngineError";
import { HistoryErrorCodes } from "./HistoryErrorCodes";

export class EmptyInitialHistoryJsonError extends EngineError<void> {
  constructor() {
    super(
      HistoryErrorCodes.EMPTY_INITIAL_HISTORY_JSON,
      "Initial document JSON cannot be an empty string!",
      HISTORY_ERROR_NAMESPACE,
    );
  }
}

export const isEmptyInitialHistoryJsonError = (
  error: unknown,
): error is EmptyInitialHistoryJsonError => {
  return error instanceof EmptyInitialHistoryJsonError;
};
