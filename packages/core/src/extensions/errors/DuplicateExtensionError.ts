import { EngineError, EXTENSION_ERROR_NAMESPACE } from "../../errors/EngineError";
import { ExtensionErrorCodes } from "./ExtensionErrorCodes";

export class DuplicateExtensionError extends EngineError<{ name: string }> {
  constructor(name: string) {
    super(
      ExtensionErrorCodes.DUPLICATE_EXTENSION,
      `An extension with the name "${name}" is already registered!`,
      EXTENSION_ERROR_NAMESPACE,
      { name },
    );
  }
}

export const isDuplicateExtensionError = (
  error: unknown,
): error is DuplicateExtensionError => {
  return error instanceof DuplicateExtensionError;
};
