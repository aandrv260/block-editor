import { EngineError, EXTENSION_ERROR_NAMESPACE } from "../../errors/EngineError";
import type { TransactionHook } from "../models/extension.models";
import { ExtensionErrorCodes } from "./ExtensionErrorCodes";

export class AsyncExtensionHookError extends EngineError<{
  name: string;
  hook: TransactionHook;
}> {
  constructor(name: string, hook: TransactionHook) {
    super(
      ExtensionErrorCodes.ASYNC_EXTENSION_HOOK,
      `The "${hook}" hook of the extension "${name}" must be synchronous and cannot return a promise!`,
      EXTENSION_ERROR_NAMESPACE,
      { name, hook },
    );
  }
}

export const isAsyncExtensionHookError = (
  error: unknown,
): error is AsyncExtensionHookError => {
  return error instanceof AsyncExtensionHookError;
};
