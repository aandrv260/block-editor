import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class UnknownCommandError extends EngineError<{ type: string }> {
  constructor(type: string) {
    super(
      CommandErrorCodes.UNKNOWN_COMMAND,
      `There is no command registered for the type "${type}"!`,
      COMMAND_ERROR_NAMESPACE,
      { type },
    );
  }
}

export const isUnknownCommandError = (
  error: unknown,
): error is UnknownCommandError => {
  return error instanceof UnknownCommandError;
};
