import { EngineError, EXTENSION_ERROR_NAMESPACE } from "../../errors/EngineError";
import { ExtensionErrorCodes } from "./ExtensionErrorCodes";

export class ExtensionWithoutHooksError extends EngineError<{ name: string }> {
  constructor(name: string) {
    super(
      ExtensionErrorCodes.EXTENSION_WITHOUT_HOOKS,
      `The extension "${name}" does not define any hooks, so it would never run!`,
      EXTENSION_ERROR_NAMESPACE,
      { name },
    );
  }
}

export const isExtensionWithoutHooksError = (
  error: unknown,
): error is ExtensionWithoutHooksError => {
  return error instanceof ExtensionWithoutHooksError;
};
