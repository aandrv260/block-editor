import { getObjectKeys } from "@/common/object.utils";
import { AsyncExtensionHookError } from "../errors/AsyncExtensionHookError";
import { DuplicateExtensionError } from "../errors/DuplicateExtensionError";
import { ExtensionWithoutHooksError } from "../errors/ExtensionWithoutHooksError";
import type { Extension, TransactionHook } from "../models/extension.models";

type ExtensionFeature = Exclude<keyof Extension, "name">;

const EXTENSION_HOOKS = {
  beforeCommand: true,
  afterCommand: true,
  beforeCommit: true,
  onCreate: true,
  onDestroy: true,
  on: true,
} as const satisfies Record<ExtensionFeature, true>;

export const ensureExtensionsHaveHooks = (
  extensions: readonly Extension[],
): void => {
  extensions.forEach(extension => {
    const hasHook = getObjectKeys(EXTENSION_HOOKS).some(
      hook => extension[hook] !== undefined,
    );

    if (!hasHook) {
      throw new ExtensionWithoutHooksError(extension.name);
    }
  });
};

export const ensureUniqueExtensionNames = (
  extensions: readonly Extension[],
): void => {
  const names = new Set<string>();

  extensions.forEach(({ name }) => {
    if (names.has(name)) {
      throw new DuplicateExtensionError(name);
    }

    names.add(name);
  });
};

export const ensureHookIsSynchronous = (
  result: unknown,
  extensionName: string,
  hook: TransactionHook,
): void => {
  if (result instanceof Promise) {
    throw new AsyncExtensionHookError(extensionName, hook);
  }
};
