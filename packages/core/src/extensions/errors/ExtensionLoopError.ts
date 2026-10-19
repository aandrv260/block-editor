import { EngineError, EXTENSION_ERROR_NAMESPACE } from "../../errors/EngineError";
import { ExtensionErrorCodes } from "./ExtensionErrorCodes";

export class ExtensionLoopError extends EngineError<{ maxDepth: number }> {
  constructor(maxDepth: number) {
    super(
      ExtensionErrorCodes.EXTENSION_LOOP,
      `Extensions ran follow-up commands more than ${maxDepth} levels deep. They probably keep triggering each other!`,
      EXTENSION_ERROR_NAMESPACE,
      { maxDepth },
    );
  }
}

export const isExtensionLoopError = (
  error: unknown,
): error is ExtensionLoopError => {
  return error instanceof ExtensionLoopError;
};
