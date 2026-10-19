import type {
  AnyCommands,
  CommandArgsOf,
} from "@/commands/executors/commandExecutors.models";
import type { DefaultCommands } from "@/commands/executors/defaultCommands";
import type { Transaction } from "@/commands/transaction/transaction.models";
import type { ReadonlyEditorDocument } from "@/document/models/document.models";
import type {
  AnyCustomEvents,
  CommandEvent,
  EditorEventsMap,
} from "@/events/editor-event-bus/editorEvent.models";

export type CommandOf<TCommands extends AnyCommands> = {
  [TType in keyof TCommands & string]: {
    type: TType;
    payload: CommandArgsOf<TCommands[TType]>[0];
  };
}[keyof TCommands & string];

export type ExtensionCommand = CommandOf<DefaultCommands>;

export type ExtensionExecute = Transaction<DefaultCommands>["execute"];

export type ExtensionLifecycleContext = {
  document: ReadonlyEditorDocument;
};

export type BeforeCommandContext = {
  command: ExtensionCommand;
  document: ReadonlyEditorDocument;
  abort: () => never;
};

export type AfterCommandContext = {
  command: ExtensionCommand;
  events: readonly CommandEvent<AnyCustomEvents>[];
  document: ReadonlyEditorDocument;
  execute: ExtensionExecute;
  abort: () => never;
};

export type BeforeCommitContext = {
  commands: readonly ExtensionCommand[];
  events: readonly CommandEvent<AnyCustomEvents>[];
  document: ReadonlyEditorDocument;
  execute: ExtensionExecute;
  abort: () => never;
};

export type ExtensionListeners = {
  [TType in keyof EditorEventsMap]?: (event: EditorEventsMap[TType]) => void;
};

export type Extension = {
  /**
   * A unique name for the extension. Two extensions with the same name throw a `DuplicateExtensionError`.
   * An extension that defines no hooks throws an `ExtensionWithoutHooksError`.
   */
  name: string;

  /**
   * Runs before every command, in the order of the editor's extensions.
   * Return nothing to let the command through, or return a whole new command to replace it.
   * Call `abort` to roll back the whole transaction without an error.
   *
   * It runs inside the transaction, so it must be synchronous.
   * Returning a promise throws an `AsyncExtensionHookError` and rolls back the whole transaction.
   */
  beforeCommand?: (context: BeforeCommandContext) => ExtensionCommand | void;

  /**
   * Runs after every command, inside the same transaction, with the events the command returned.
   * Commands run with `execute` belong to the same transaction and are undone in the same step.
   *
   * It runs inside the transaction, so it must be synchronous.
   * Returning a promise throws an `AsyncExtensionHookError` and rolls back the whole transaction.
   */
  afterCommand?: (context: AfterCommandContext) => void;

  /**
   * Runs once per transaction, right before it commits, with every command that ran and every event the transaction collected.
   * The commands are in the order they ran, after any replacement by `beforeCommand`, and include follow-up commands.
   * Commands run with `execute` belong to the same transaction and are undone in the same step.
   * Each extension gets its own copy of the commands and events, which includes the follow-up commands of the extensions before it.
   *
   * It runs inside the transaction, so it must be synchronous.
   * Returning a promise throws an `AsyncExtensionHookError` and rolls back the whole transaction.
   */
  beforeCommit?: (context: BeforeCommitContext) => void;

  /**
   * Runs once when the editor is created, after the extension listeners are added.
   * It can be async, but the editor does not wait for it or catch its errors.
   */
  onCreate?: (context: ExtensionLifecycleContext) => void;

  /**
   * Runs once when the editor is cleaned up, before the extension listeners are removed.
   * It can be async, but the editor does not wait for it or catch its errors.
   */
  onDestroy?: (context: ExtensionLifecycleContext) => void;

  /**
   * Event listeners owned by the extension. They are added when the editor is created and removed when it is cleaned up.
   * They run after a change is committed, like listeners added with `editor.subscribe`, so they can be async.
   */
  on?: ExtensionListeners;
};

export type TransactionHook = "beforeCommand" | "afterCommand" | "beforeCommit";

export type ExecutableCommand = {
  type: string;
  payload: unknown;
};

export type ExtensionHookActions = {
  document: ReadonlyEditorDocument;
  execute: ExtensionExecute;
  abort: () => never;
};
