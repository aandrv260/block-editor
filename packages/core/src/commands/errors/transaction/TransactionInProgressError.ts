import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class TransactionInProgressError extends EngineError<{ operation: string }> {
  constructor(operation: string) {
    super(
      CommandErrorCodes.TRANSACTION_IN_PROGRESS,
      `You can't run "${operation}" while a transaction is open!`,
      COMMAND_ERROR_NAMESPACE,
      { operation },
    );
  }
}

export const isTransactionInProgressError = (
  error: unknown,
): error is TransactionInProgressError => {
  return error instanceof TransactionInProgressError;
};
