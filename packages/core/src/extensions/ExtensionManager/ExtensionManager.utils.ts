import type { AnyCommands } from "@/commands/executors/commandExecutors.models";
import { getObjectEntries, getObjectKeys } from "@/common/object.utils";
import { AsyncExtensionHookError } from "../errors/AsyncExtensionHookError";
import { DuplicateCommandError } from "../errors/DuplicateCommandError";
import { DuplicateExtensionError } from "../errors/DuplicateExtensionError";
import { NoopExtensionError } from "../errors/NoopExtensionError";
import type {
  AnyExtension,
  Extension,
  TransactionHook,
} from "../models/extension.models";

type RuntimeExtensionField = Exclude<keyof Extension, "name" | "events">;

const RUNTIME_EXTENSION_FIELDS = {
  commands: true,
  onBeforeCommand: true,
  onAfterCommand: true,
  onBeforeCommit: true,
  onEditorInit: true,
  onEditorDestroy: true,
} as const satisfies Record<RuntimeExtensionField, true>;

export const ensureNoNoopExtensions = (
  extensions: readonly AnyExtension[],
): void => {
  extensions.forEach(extension => {
    const doesSomething = getObjectKeys(RUNTIME_EXTENSION_FIELDS).some(
      field => extension[field] !== undefined,
    );

    if (!doesSomething) {
      throw new NoopExtensionError(extension.name);
    }
  });
};

export const ensureUniqueExtensionNames = (
  extensions: readonly AnyExtension[],
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

export const mergeExtensionCommands = (
  builtInCommands: AnyCommands,
  extensions: readonly AnyExtension[],
): AnyCommands => {
  const commands: AnyCommands = { ...builtInCommands };

  extensions.forEach(({ name, commands: createCommands }) => {
    if (!createCommands) {
      return;
    }

    const extensionCommands = createCommands({ createCommand: command => command });

    getObjectEntries(extensionCommands).forEach(([type, command]) => {
      if (Object.hasOwn(commands, type)) {
        throw new DuplicateCommandError(type, name);
      }

      commands[type] = command;
    });
  });

  return commands;
};
