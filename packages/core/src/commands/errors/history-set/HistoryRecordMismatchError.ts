import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class HistoryRecordMismatchError extends EngineError<void> {
  constructor() {
    super(
      CommandErrorCodes.HISTORY_RECORD_MISMATCH,
      "The last record in the history is not the same as the current document!",
      COMMAND_ERROR_NAMESPACE,
    );
  }
}

export const isHistoryRecordMismatchError = (
  error: unknown,
): error is HistoryRecordMismatchError => {
  return error instanceof HistoryRecordMismatchError;
};
