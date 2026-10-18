import type { EditorAction } from "../../actions/actions.models";
import type { DocumentHistory } from "../../history/DocumentHistory";
import { HistoryManager } from "../../history/HistoryManager";
import { EditorDocument } from "../../document/EditorDocument";
import { createEditorChangeEvent } from "../../events/editor-event-bus/editorEvent.emits";
import type {
  CommandEvent,
  EditorEventBus,
} from "../../events/editor-event-bus/editorEvent.models";
import type {
  CommandArgsOf,
  CommandContext,
  Commands,
} from "../executors/commandExecutors.models";
import { executeAction } from "../executors/executeAction";
import { UnknownCommandError } from "../errors/unknown-command/UnknownCommandError";

interface CommandCenterConfig<TCommands extends Commands> {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
  commands: TCommands;
}

/**
 * Responsibilities:
 * - For a command type and its payload, it will execute the registered command and update the history.
 * - It delegates the history operations (undo, redo, jump and set) to the history manager because they are not actions.
 * - It emits the editor change event after every action and history operation.
 * - This is the only part of the system allowed to mutate the document and history.
 */
export class CommandCenter<TCommands extends Commands> {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly historyManager: HistoryManager;
  private readonly eventBus: EditorEventBus;
  private readonly commands: TCommands;

  constructor({
    document,
    history,
    eventBus,
    commands,
  }: CommandCenterConfig<TCommands>) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
    this.commands = commands;
    this.historyManager = new HistoryManager({ document, history, eventBus });
  }

  /**
   * Execute a command to mutate the editor.

   * Throws an `UnknownCommandError` if no command is registered for the type.
   */
  public execute<TType extends keyof TCommands & string>(
    type: TType,
    ...args: CommandArgsOf<TCommands[TType]>
  ): void {
    const command = this.getCommand(type);
    const event = command({ payload: args[0], document: this.document });

    this.commit(type, event);
  }

  private getCommand(
    type: string,
  ): (context: CommandContext<unknown>) => CommandEvent {
    if (!Object.hasOwn(this.commands, type)) {
      throw new UnknownCommandError(type);
    }

    return this.commands[type] as (context: CommandContext<unknown>) => CommandEvent;
  }

  // TODO: Remove together with the action creators once every caller uses `execute`.
  public processAction(action: EditorAction) {
    const event = executeAction({
      type: action.type,
      payload: action.payload,
      document: this.document,
    });

    this.commit(action.type, event);
  }

  private commit(type: string, event: CommandEvent) {
    this.recordHistory(event);
    this.eventBus.emit(event.type, event);
    this.emitChangeEvent(type);
  }

  public undo(): void {
    this.historyManager.undo();
    this.emitChangeEvent("history:undo");
  }

  public redo(): void {
    this.historyManager.redo();
    this.emitChangeEvent("history:redo");
  }

  public jumpTo(index: number): void {
    this.historyManager.jumpTo(index);
    this.emitChangeEvent("history:jump");
  }

  public setHistory(newHistory: readonly string[]): void {
    this.historyManager.setHistory(newHistory);
    this.emitChangeEvent("history:set");
  }

  // TODO: Maybe put in the history manager.
  private recordHistory(event: CommandEvent) {
    const shouldClearHistory =
      event.type === "document:swap" && event.historyCleared;

    if (shouldClearHistory) {
      this.historyManager.clear();
    }

    this.historyManager.record();
  }

  private emitChangeEvent(trigger: string) {
    this.eventBus.emit(
      "editor:change",
      createEditorChangeEvent({
        documentJSON: this.document.toJSON(),
        history: this.history.getHistory(),
        currentPositionInHistory: this.history.getCurrentPosition(),
        root: this.document.getRoot(),
        triggerAction: trigger,
      }),
    );
  }
}
