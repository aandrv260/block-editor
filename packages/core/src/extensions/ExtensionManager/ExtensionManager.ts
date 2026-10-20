import type { ExecutableCommand } from "@/commands/executors/commandExecutors.models";
import type { ReadonlyEditorDocument } from "@/document/models/document.models";
import type { UnsubscribeFn } from "@/events/event-bus/EventBus";
import type {
  AnyCustomEvents,
  CommandEvent,
  EditorEventBus,
  EditorEventHandler,
  EditorEventType,
} from "@/events/editor-event-bus/editorEvent.models";
import { ExtensionLoopError } from "../errors/ExtensionLoopError";
import type {
  AnyExtension,
  CommandSource,
  CommittedCommand,
  ExecutedCommand,
  ExtensionCommand,
  ExtensionHookActions,
} from "../models/extension.models";
import {
  ensureNoNoopExtensions,
  ensureHookIsSynchronous,
  ensureUniqueExtensionNames,
} from "./ExtensionManager.utils";

export const MAX_EXTENSION_DEPTH = 10;

interface ExtensionManagerConfig {
  extensions: readonly AnyExtension[];
  document: ReadonlyEditorDocument;
  eventBus: EditorEventBus;
}

export class ExtensionManager {
  private readonly extensions: readonly AnyExtension[];
  private readonly document: ReadonlyEditorDocument;
  private readonly eventBus: EditorEventBus;
  private readonly unsubscribeFns: UnsubscribeFn[] = [];
  private readonly cleanups: VoidFunction[] = [];
  private isDestroyed = false;
  private depth = 0;

  constructor({ extensions, document, eventBus }: ExtensionManagerConfig) {
    ensureNoNoopExtensions(extensions);
    ensureUniqueExtensionNames(extensions);
    this.extensions = extensions;
    this.document = document;
    this.eventBus = eventBus;
  }

  public init(): void {
    this.extensions.forEach(({ onEditorInit }) =>
      onEditorInit?.({
        document: this.document,
        subscribe: (event, handler) => this.subscribe(event, handler),
        onCleanup: cleanup => this.addCleanup(cleanup),
      }),
    );
  }

  public destroy(): void {
    this.isDestroyed = true;

    this.extensions.forEach(({ onEditorDestroy }) =>
      onEditorDestroy?.({ document: this.document }),
    );

    this.cleanups.splice(0).forEach(cleanup => cleanup());
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
    source: CommandSource,
    { document, abort }: ExtensionHookActions,
  ): ExecutableCommand {
    return this.extensions.reduce<ExecutableCommand>(
      (currentCommand, { name, onBeforeCommand }) => {
        const replacement = onBeforeCommand?.({
          command: currentCommand as ExtensionCommand,
          source,
          document,
          abort,
        });

        ensureHookIsSynchronous(replacement, name, "onBeforeCommand");

        return replacement ?? currentCommand;
      },
      command,
    );
  }

  public runAfterCommand(
    command: ExecutableCommand,
    source: CommandSource,
    events: readonly CommandEvent<AnyCustomEvents>[],
    { document, createExecute, abort }: ExtensionHookActions,
  ): void {
    this.extensions.forEach(({ name, onAfterCommand }) => {
      const result = onAfterCommand?.({
        command: command as ExtensionCommand,
        source,
        events,
        document,
        execute: createExecute({ type: "extension", name }),
        abort,
      });

      ensureHookIsSynchronous(result, name, "onAfterCommand");
    });
  }

  public runBeforeCommit(
    commands: readonly ExecutedCommand[],
    events: readonly CommandEvent<AnyCustomEvents>[],
    { document, createExecute, abort }: ExtensionHookActions,
  ): void {
    this.extensions.forEach(({ name, onBeforeCommit }) => {
      const result = onBeforeCommit?.({
        commands: [...commands] as CommittedCommand[],
        events: [...events],
        document,
        execute: createExecute({ type: "extension", name }),
        abort,
      });

      ensureHookIsSynchronous(result, name, "onBeforeCommit");
    });
  }

  private subscribe<TType extends EditorEventType>(
    event: TType,
    handler: EditorEventHandler<TType>,
  ): UnsubscribeFn {
    if (this.isDestroyed) {
      return () => {};
    }

    const unsubscribe = this.eventBus.on(event, handler);

    this.unsubscribeFns.push(unsubscribe);

    return unsubscribe;
  }

  private addCleanup(cleanup: VoidFunction): void {
    if (this.isDestroyed) {
      cleanup();
      return;
    }

    this.cleanups.push(cleanup);
  }
}
