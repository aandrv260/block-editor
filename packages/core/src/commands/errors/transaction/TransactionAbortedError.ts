import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class TransactionAbortedError extends EngineError<void> {
  constructor() {
    super(
      CommandErrorCodes.TRANSACTION_ABORTED,
      "The transaction was aborted!",
      COMMAND_ERROR_NAMESPACE,
    );
  }
}

export const isTransactionAbortedError = (
  error: unknown,
): error is TransactionAbortedError => {
  return error instanceof TransactionAbortedError;
};
