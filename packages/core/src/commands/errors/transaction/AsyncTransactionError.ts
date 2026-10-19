import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class AsyncTransactionError extends EngineError<void> {
  constructor() {
    super(
      CommandErrorCodes.ASYNC_TRANSACTION,
      "A transaction must be synchronous and cannot return a promise!",
      COMMAND_ERROR_NAMESPACE,
    );
  }
}

export const isAsyncTransactionError = (
  error: unknown,
): error is AsyncTransactionError => {
  return error instanceof AsyncTransactionError;
};
