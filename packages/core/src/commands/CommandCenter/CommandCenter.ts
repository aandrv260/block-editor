import type { DocumentHistory } from "../../history/DocumentHistory";
import { HistoryManager } from "../../history/HistoryManager";
import { EditorDocument } from "../../document/EditorDocument";
import { createEvent } from "../../events/editor-event-bus/createEvent";
import type {
  AnyCustomEvents,
  CommandEvent,
  EditorEventBus,
} from "../../events/editor-event-bus/editorEvent.models";
import type {
  CommandArgsOf,
  AnyCommands,
} from "../executors/commandExecutors.models";
import { TransactionManager } from "../transaction/TransactionManager";
import type { TransactionCallback } from "../transaction/transaction.models";
import { ExtensionManager } from "../../extensions/ExtensionManager/ExtensionManager";
import type { Extension } from "../../extensions/models/extension.models";

interface CommandCenterConfig {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
  commands: AnyCommands;
  extensions: readonly Extension[];
  historyGroupDelay: number;
}

/**
 * Responsibilities:
 * - For a command type and its payload, it will execute the registered command and update the history.
 * - It delegates the history operations (undo, redo, jump and set) to the history manager because they are not commands.
 * - It emits the editor change event after every command and history operation.
 * - It delegates the extension hooks, listeners and lifecycle to the extension manager.
 * - This is the only part of the system allowed to mutate the document and history.
 */
export class CommandCenter<TCommands extends AnyCommands> {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly historyManager: HistoryManager;
  private readonly transactionManager: TransactionManager<TCommands>;
  private readonly extensionManager: ExtensionManager;
  private readonly eventBus: EditorEventBus;

  constructor({
    document,
    history,
    eventBus,
    commands,
    extensions,
    historyGroupDelay,
  }: CommandCenterConfig) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
    this.historyManager = new HistoryManager({
      document,
      history,
      eventBus,
      groupDelay: historyGroupDelay,
    });

    this.extensionManager = new ExtensionManager({ extensions, document, eventBus });
    this.transactionManager = new TransactionManager({
      document,
      history,
      commands,
      extensionManager: this.extensionManager,
    });

    this.extensionManager.init();
  }

  /**
   * Execute a command to mutate the editor.

   * Throws an `UnknownCommandError` if no command is registered for the type.
   */
  public execute<TType extends keyof TCommands & string>(
    type: TType,
    ...args: CommandArgsOf<TCommands[TType]>
  ): void {
    this.runTransaction(type, transaction => transaction.execute(type, ...args));
  }

  public transaction<TReturn>(
    callback: TransactionCallback<TCommands, TReturn>,
  ): void {
    this.runTransaction("transaction", callback);
  }

  private runTransaction(
    trigger: string,
    callback: TransactionCallback<TCommands, unknown>,
  ): void {
    const result = this.transactionManager.run(trigger, callback);

    if (result.status !== "committed" && result.isDocumentRestored) {
      this.emitChangeEvent("rollback");
    }

    if (result.status === "failed") {
      throw result.error;
    }

    if (result.status === "committed" && result.events.length > 0) {
      this.historyManager.record(result.events);
      this.forwardCommandEvents(result.events);
      this.emitChangeEvent(trigger);
    }
  }

  public undo(): void {
    this.transactionManager.ensureNoOpenTransaction("undo");
    this.historyManager.undo();
    this.emitChangeEvent("undo");
  }

  public redo(): void {
    this.transactionManager.ensureNoOpenTransaction("redo");
    this.historyManager.redo();
    this.emitChangeEvent("redo");
  }

  public jumpTo(index: number): void {
    this.transactionManager.ensureNoOpenTransaction("jumpTo");
    this.historyManager.jumpTo(index);
    this.emitChangeEvent("jumpTo");
  }

  public setHistory(newHistory: readonly string[]): void {
    this.transactionManager.ensureNoOpenTransaction("setHistory");
    this.historyManager.setHistory(newHistory);
    this.emitChangeEvent("setHistory");
  }

  public cleanup(): void {
    this.extensionManager.destroy();
  }

  private forwardCommandEvents(events: CommandEvent<AnyCustomEvents>[]): void {
    const commandEventBus = this.eventBus as EditorEventBus<AnyCustomEvents>;
    events.forEach(event => commandEventBus.emit(event.type, event));
  }

  // TODO: This should be done through hook/extension because it gets triggerred always when there is a change to the editor.
  private emitChangeEvent(trigger: string) {
    this.eventBus.emit(
      "editor:change",
      createEvent("editor:change", {
        documentJSON: this.history.getCurrent() ?? this.document.toJSON(),
        history: this.history.getHistory(),
        currentPositionInHistory: this.history.getCurrentPosition(),
        root: this.document.getRoot(),
        trigger,
      }),
    );
  }
}
