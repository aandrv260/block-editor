import { EngineError, EXTENSION_ERROR_NAMESPACE } from "../../errors/EngineError";
import { ExtensionErrorCodes } from "./ExtensionErrorCodes";

export class NoopExtensionError extends EngineError<{ name: string }> {
  constructor(name: string) {
    super(
      ExtensionErrorCodes.NOOP_EXTENSION,
      `The extension "${name}" defines no hooks and no commands, so it does nothing!`,
      EXTENSION_ERROR_NAMESPACE,
      { name },
    );
  }
}

export const isNoopExtensionError = (
  error: unknown,
): error is NoopExtensionError => {
  return error instanceof NoopExtensionError;
};
