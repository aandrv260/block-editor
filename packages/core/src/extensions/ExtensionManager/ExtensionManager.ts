import { getObjectKeys } from "@/common/object.utils";
import type { ReadonlyEditorDocument } from "@/document/models/document.models";
import type { UnsubscribeFn } from "@/events/event-bus/EventBus";
import type {
  AnyCustomEvents,
  CommandEvent,
  EditorEventBus,
  EditorEventsMap,
} from "@/events/editor-event-bus/editorEvent.models";
import { ExtensionLoopError } from "../errors/ExtensionLoopError";
import type {
  ExecutableCommand,
  Extension,
  ExtensionCommand,
  ExtensionHookActions,
  ExtensionListeners,
} from "../models/extension.models";
import {
  ensureExtensionsHaveHooks,
  ensureHookIsSynchronous,
  ensureUniqueExtensionNames,
} from "./ExtensionManager.utils";

export const MAX_EXTENSION_DEPTH = 10;

interface ExtensionManagerConfig {
  extensions: readonly Extension[];
  document: ReadonlyEditorDocument;
  eventBus: EditorEventBus;
}

export class ExtensionManager {
  private readonly extensions: readonly Extension[];
  private readonly document: ReadonlyEditorDocument;
  private readonly eventBus: EditorEventBus;
  private readonly unsubscribeFns: UnsubscribeFn[] = [];
  private depth = 0;

  constructor({ extensions, document, eventBus }: ExtensionManagerConfig) {
    ensureExtensionsHaveHooks(extensions);
    ensureUniqueExtensionNames(extensions);
    this.extensions = extensions;
    this.document = document;
    this.eventBus = eventBus;
  }

  public init(): void {
    this.extensions.forEach(({ on }) => on && this.addListeners(on));
    this.extensions.forEach(({ onCreate }) =>
      onCreate?.({ document: this.document }),
    );
  }

  public destroy(): void {
    this.extensions.forEach(({ onDestroy }) =>
      onDestroy?.({ document: this.document }),
    );

    this.unsubscribeFns.splice(0).forEach(unsubscribe => unsubscribe());
  }

  public runWithLoopGuard(callback: () => void): void {
    if (this.depth >= MAX_EXTENSION_DEPTH) {
      throw new ExtensionLoopError(MAX_EXTENSION_DEPTH);
    }

    this.depth++;

    try {
      callback();
    } finally {
      this.depth--;
    }
  }

  public runBeforeCommand(
    command: ExecutableCommand,
    { document, abort }: ExtensionHookActions,
  ): ExecutableCommand {
    return this.extensions.reduce<ExecutableCommand>(
      (currentCommand, { name, beforeCommand }) => {
        const replacement = beforeCommand?.({
          command: currentCommand as ExtensionCommand,
          document,
          abort,
        });

        ensureHookIsSynchronous(replacement, name, "beforeCommand");

        return replacement ?? currentCommand;
      },
      command,
    );
  }

  public runAfterCommand(
    command: ExecutableCommand,
    events: readonly CommandEvent<AnyCustomEvents>[],
    actions: ExtensionHookActions,
  ): void {
    this.extensions.forEach(({ name, afterCommand }) => {
      const result = afterCommand?.({
        command: command as ExtensionCommand,
        events,
        ...actions,
      });

      ensureHookIsSynchronous(result, name, "afterCommand");
    });
  }

  public runBeforeCommit(
    commands: readonly ExecutableCommand[],
    events: readonly CommandEvent<AnyCustomEvents>[],
    actions: ExtensionHookActions,
  ): void {
    this.extensions.forEach(({ name, beforeCommit }) => {
      const result = beforeCommit?.({
        commands: [...commands] as ExtensionCommand[],
        events: [...events],
        ...actions,
      });

      ensureHookIsSynchronous(result, name, "beforeCommit");
    });
  }

  private addListeners(listeners: ExtensionListeners): void {
    getObjectKeys(listeners).forEach(
      <TType extends keyof EditorEventsMap>(type: TType) => {
        const listener = listeners[type];

        if (listener) {
          this.unsubscribeFns.push(this.eventBus.on(type, listener));
        }
      },
    );
  }
}
