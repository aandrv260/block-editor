import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class TransactionClosedError extends EngineError<void> {
  constructor() {
    super(
      CommandErrorCodes.TRANSACTION_CLOSED,
      "The transaction has already finished!",
      COMMAND_ERROR_NAMESPACE,
    );
  }
}

export const isTransactionClosedError = (
  error: unknown,
): error is TransactionClosedError => {
  return error instanceof TransactionClosedError;
};
