import type {
  AnyCommands,
  CommandOf,
  ExecutableCommand,
} from "@/commands/executors/commandExecutors.models";
import type { Transaction } from "@/commands/transaction/transaction.models";
import type { ReadonlyEditorDocument } from "@/document/models/document.models";
import type {
  CommandBuilder,
  EditorCommands,
  NoCustomCommands,
  WithoutBuiltInCommandNames,
} from "@/editor/editor-commands.models";
import type {
  AnyCustomEvents,
  CommandEvent,
  EditorEventHandler,
  EditorEventType,
  EventsDefinition,
  NoCustomEvents,
} from "@/events/editor-event-bus/editorEvent.models";

export type ExtensionCommand<TCommands = NoCustomCommands> = CommandOf<
  EditorCommands<TCommands>
>;

export type ExtensionExecute<TCommands = NoCustomCommands> = Transaction<
  EditorCommands<TCommands>
>["execute"];

export type ExtensionSubscribe<TEvents = NoCustomEvents> = <
  TType extends EditorEventType<TEvents>,
>(
  event: TType,
  handler: EditorEventHandler<TType, TEvents>,
) => VoidFunction;

export type EditorInitContext<TEvents = NoCustomEvents> = {
  document: ReadonlyEditorDocument;
  subscribe: ExtensionSubscribe<TEvents>;
  onCleanup: (cleanup: VoidFunction) => void;
};

export type EditorDestroyContext = {
  document: ReadonlyEditorDocument;
};

export type ExtensionCommandSource = {
  type: "extension";
  name: string;
};

export type CommandSource = { type: "editor" } | ExtensionCommandSource;

export type CommittedCommand<TCommands = NoCustomCommands> =
  ExtensionCommand<TCommands> & { source: CommandSource };

export type ExecutedCommand = ExecutableCommand & { source: CommandSource };

export type BeforeCommandContext<TCommands = NoCustomCommands> = {
  command: ExtensionCommand<TCommands>;
  source: CommandSource;
  document: ReadonlyEditorDocument;
  abort: () => never;
};

export type AfterCommandContext<TCommands = NoCustomCommands> = {
  command: ExtensionCommand<TCommands>;
  source: CommandSource;
  events: readonly CommandEvent<AnyCustomEvents>[];
  document: ReadonlyEditorDocument;
  execute: ExtensionExecute<TCommands>;
  abort: () => never;
};

export type BeforeCommitContext<TCommands = NoCustomCommands> = {
  commands: readonly CommittedCommand<TCommands>[];
  events: readonly CommandEvent<AnyCustomEvents>[];
  document: ReadonlyEditorDocument;
  execute: ExtensionExecute<TCommands>;
  abort: () => never;
};

export type Extension<TEvents = NoCustomEvents, TCommands = NoCustomCommands> = {
  /**
   * A unique name for the extension.
   */
  name: string;

  /**
   * Define custom events that the extension's commands can return and listeners can subscribe to.
   */
  events?: EventsDefinition<TEvents>;

  /**
   * Add custom commands to the editor.
   *
   * Create each command with `createCommand`, so its payload and the events it returns are typed.
   */
  commands?: (
    builder: CommandBuilder<TEvents>,
  ) => WithoutBuiltInCommandNames<TCommands>;

  /**
   * Runs before every command, in the order of the editor's extensions.
   *
   * Return nothing to let the command through, or return a whole new command to replace it.
   * A replaced command keeps the `source` of the original one.
   *
   * `source` tells whether app code ran the command or an extension ran it as a follow-up command.
   *
   * It runs inside the transaction, so it must be synchronous.
   */
  onBeforeCommand?: (
    context: BeforeCommandContext<TCommands>,
  ) => ExtensionCommand<TCommands> | void;

  /**
   * Runs after every command, inside the same transaction, with the events the command returned.
   *
   * Commands run with `context.execute` belong to the same transaction and are undone in the same step.
   *
   * `source` tells whether app code ran the command or an extension ran it as a follow-up command.
   *
   * It runs inside the transaction, so it must be synchronous.
   */
  onAfterCommand?: (context: AfterCommandContext<TCommands>) => void;

  /**
   * Runs once per transaction, right before it commits, with every command that ran and every event the transaction collected.
   *
   * The commands are in the order they ran, after any replacement by `onBeforeCommand`, and include follow-up commands.
   * Each command has a `source` that tells whether app code ran it or which extension ran it as a follow-up command.
   *
   * Commands run with `context.execute` belong to the same transaction and are undone in the same step.
   */
  onBeforeCommit?: (context: BeforeCommitContext<TCommands>) => void;

  /**
   * Runs once when the editor initializes its extensions.
   * Use `subscribe` to listen to built-in events and the extension's own events.
   *
   * The listeners run after a change is committed, like listeners added with `editor.subscribe`.
   * They are removed when the editor is cleaned up, and calling `subscribe` after that does nothing.
   *
   * Use `onCleanup` to release what this hook creates, such as timers.
   * The cleanups run in registration order on `editor.cleanup()`, after every `onEditorDestroy` and before the listeners are removed.
   * A cleanup registered after the editor is cleaned up runs right away.
   *
   * It can be async, but the editor does not wait for it or catch its errors.
   *
   * Example:
   * ```TS
   * const AutosaveExtension = (options: { delay: number }) =>
   *   defineExtension({
   *     name: "AutosaveExtension",
   *     onEditorInit: ({ subscribe, onCleanup }) => {
   *       let timer: ReturnType<typeof setTimeout> | undefined;
   *
   *       subscribe("editor:change", event => {
   *         clearTimeout(timer);
   *         timer = setTimeout(() => save(event.documentJSON), options.delay);
   *       });
   *
   *       onCleanup(() => clearTimeout(timer));
   *     },
   *   });
   * ```
   */
  onEditorInit?: (context: EditorInitContext<TEvents>) => void;

  /**
   * Runs once when the editor is cleaned up, before the listeners added with `subscribe` are removed.
   *
   * It can be async, but the editor does not wait for it or catch its errors.
   */
  onEditorDestroy?: (context: EditorDestroyContext) => void;
};

export type AnyExtension = {
  name: string;
  events?: EventsDefinition<unknown>;
  commands?: (builder: {
    createCommand: <TCommand>(command: TCommand) => TCommand;
  }) => AnyCommands;
  onBeforeCommand?(context: {
    command: ExtensionCommand;
    source: CommandSource;
    document: ReadonlyEditorDocument;
    abort: () => never;
  }): ExecutableCommand | void;
  onAfterCommand?(context: {
    command: ExtensionCommand;
    source: CommandSource;
    events: readonly CommandEvent<AnyCustomEvents>[];
    document: ReadonlyEditorDocument;
    execute: ExtensionExecute;
    abort: () => never;
  }): void;
  onBeforeCommit?(context: {
    commands: readonly CommittedCommand[];
    events: readonly CommandEvent<AnyCustomEvents>[];
    document: ReadonlyEditorDocument;
    execute: ExtensionExecute;
    abort: () => never;
  }): void;
  onEditorInit?(context: EditorInitContext): void;
  onEditorDestroy?(context: EditorDestroyContext): void;
  call?: never;
};

type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type ExtensionTypes<TExtension> =
  TExtension extends Extension<infer TEvents, infer TCommands>
    ? { events: TEvents; commands: TCommands }
    : { events: NoCustomEvents; commands: NoCustomCommands };

type EventsOfExtension<TExtension> = TExtension extends unknown
  ? unknown extends ExtensionTypes<TExtension>["events"]
    ? NoCustomEvents
    : ExtensionTypes<TExtension>["events"]
  : never;

type CommandsOfExtension<TExtension> = TExtension extends unknown
  ? unknown extends ExtensionTypes<TExtension>["commands"]
    ? NoCustomCommands
    : ExtensionTypes<TExtension>["commands"]
  : never;

export type ExtensionsEvents<TExtensions extends readonly AnyExtension[]> = [
  TExtensions[number],
] extends [never]
  ? NoCustomEvents
  : UnionToIntersection<EventsOfExtension<TExtensions[number]>>;

export type ExtensionsCommands<TExtensions extends readonly AnyExtension[]> = [
  TExtensions[number],
] extends [never]
  ? NoCustomCommands
  : UnionToIntersection<CommandsOfExtension<TExtensions[number]>>;

type WithoutUnknownFields<TExtension> = TExtension & {
  [TField in Exclude<keyof TExtension, keyof AnyExtension>]: never;
};

export type ValidExtensions<TExtensions extends readonly AnyExtension[]> = {
  [TIndex in keyof TExtensions]: WithoutUnknownFields<TExtensions[TIndex]>;
};

export type TransactionHook =
  | "onBeforeCommand"
  | "onAfterCommand"
  | "onBeforeCommit";

export type ExtensionHookActions = {
  document: ReadonlyEditorDocument;
  createExecute: (source: ExtensionCommandSource) => ExtensionExecute;
  abort: () => never;
};
