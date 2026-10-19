import type { DocumentHistory } from "../../history/DocumentHistory";
import { HistoryManager } from "../../history/HistoryManager";
import { EditorDocument } from "../../document/EditorDocument";
import { createEvent } from "../../events/editor-event-bus/createEvent";
import type {
  CommandEvent,
  EditorEventBus,
} from "../../events/editor-event-bus/editorEvent.models";
import type {
  CommandArgsOf,
  CommandContext,
  CommandResult,
  Commands,
} from "../executors/commandExecutors.models";
import { UnknownCommandError } from "../errors/unknown-command/UnknownCommandError";
import { toCommandEvents } from "./CommandCenter.utils";

interface CommandCenterConfig<TCommands extends Commands> {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
  commands: TCommands;
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
    const events = toCommandEvents(
      command({ payload: args[0], document: this.document }),
    );

    this.recordHistory(events);
    events.forEach(event => this.eventBus.emit(event.type, event));
    this.emitChangeEvent(type);
  }

  private getCommand(
    type: string,
  ): (context: CommandContext<unknown>) => CommandResult {
    if (!Object.hasOwn(this.commands, type)) {
      throw new UnknownCommandError(type);
    }

    return this.commands[type] as (
      context: CommandContext<unknown>,
    ) => CommandResult;
  }

  public undo(): void {
    this.historyManager.undo();
    this.emitChangeEvent("undo");
  }

  public redo(): void {
    this.historyManager.redo();
    this.emitChangeEvent("redo");
  }

  public jumpTo(index: number): void {
    this.historyManager.jumpTo(index);
    this.emitChangeEvent("jumpTo");
  }

  public setHistory(newHistory: readonly string[]): void {
    this.historyManager.setHistory(newHistory);
    this.emitChangeEvent("setHistory");
  }

  // TODO: Maybe put in the history manager.
  private recordHistory(events: CommandEvent[]) {
    // TODO: We need to make this generic and come through extension instead of hardcodding specific event type and parts of its payloads here.
    const shouldClearHistory = events.some(
      event => event.type === "document:swap" && event.historyCleared,
    );

    if (shouldClearHistory) {
      this.historyManager.clear();
    }

    this.historyManager.record();
  }

  private emitChangeEvent(trigger: string) {
    this.eventBus.emit(
      "editor:change",
      createEvent("editor:change", {
        documentJSON: this.document.toJSON(),
        history: this.history.getHistory(),
        currentPositionInHistory: this.history.getCurrentPosition(),
        root: this.document.getRoot(),
        trigger,
      }),
    );
  }
}
