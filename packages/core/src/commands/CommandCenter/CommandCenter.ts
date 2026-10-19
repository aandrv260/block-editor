import type { DocumentHistory } from "../../history/DocumentHistory";
import { HistoryManager } from "../../history/HistoryManager";
import { EditorDocument } from "../../document/EditorDocument";
import { createEvent } from "../../events/editor-event-bus/createEvent";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import type { CommandArgsOf, Commands } from "../executors/commandExecutors.models";
import { TransactionManager } from "../transaction/TransactionManager";
import type { TransactionCallback } from "../transaction/transaction.models";

interface CommandCenterConfig<TCommands extends Commands> {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
  commands: TCommands;
  historyGroupDelay: number;
}

/**
 * Responsibilities:
 * - For a command type and its payload, it will execute the registered command and update the history.
 * - It delegates the history operations (undo, redo, jump and set) to the history manager because they are not commands.
 * - It emits the editor change event after every command and history operation.
 * - This is the only part of the system allowed to mutate the document and history.
 */
export class CommandCenter<TCommands extends Commands> {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly historyManager: HistoryManager;
  private readonly transactionManager: TransactionManager<TCommands>;
  private readonly eventBus: EditorEventBus;

  constructor({
    document,
    history,
    eventBus,
    commands,
    historyGroupDelay,
  }: CommandCenterConfig<TCommands>) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
    this.historyManager = new HistoryManager({
      document,
      history,
      eventBus,
      groupDelay: historyGroupDelay,
    });
    this.transactionManager = new TransactionManager({
      document,
      history,
      commands,
    });
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
      result.events.forEach(event => this.eventBus.emit(event.type, event));
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
