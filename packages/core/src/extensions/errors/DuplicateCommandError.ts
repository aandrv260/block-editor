import { EngineError, EXTENSION_ERROR_NAMESPACE } from "../../errors/EngineError";
import { ExtensionErrorCodes } from "./ExtensionErrorCodes";

export class DuplicateCommandError extends EngineError<{
  command: string;
  extension: string;
}> {
  constructor(command: string, extension: string) {
    super(
      ExtensionErrorCodes.DUPLICATE_COMMAND,
      `The command "${command}" of the extension "${extension}" is already registered!`,
      EXTENSION_ERROR_NAMESPACE,
      { command, extension },
    );
  }
}

export const isDuplicateCommandError = (
  error: unknown,
): error is DuplicateCommandError => {
  return error instanceof DuplicateCommandError;
};
