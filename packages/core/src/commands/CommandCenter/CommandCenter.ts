import type { EditorAction, EditorActionType } from "../../actions/actions.models";
import type { DocumentHistory } from "../../history/DocumentHistory";
import { HistoryManager } from "../../history/HistoryManager";
import type { HistoryOperationType } from "../../history/models/history-operation.models";
import { EditorDocument } from "../../document/EditorDocument";
import { createEditorChangeEvent } from "../../events/editor-event-bus/editorEvent.emits";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import { getEditorCommand } from "../executors/commandsMap";

interface CommandCenterConfig {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
}

type ChangeTrigger = EditorActionType | HistoryOperationType;

/**
 * Responsibilities:
 * - For an action, it will execute the command corresponding to the action and update the history.
 * - It delegates the history operations (undo, redo, jump and set) to the history manager because they are not actions.
 * - It emits the editor change event after every action and history operation.
 * - This is the only part of the system allowed to mutate the document and history.
 */
export class CommandCenter {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly historyManager: HistoryManager;
  private readonly eventBus: EditorEventBus;

  constructor({ document, history, eventBus }: CommandCenterConfig) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
    this.historyManager = new HistoryManager({ document, history, eventBus });
  }

  public processAction(action: EditorAction) {
    const command = getEditorCommand({
      type: action.type,
      payload: action.payload,
      document: this.document,
    });

    const event = command.execute();

    this.recordHistory(action);
    this.eventBus.emit(event.type, event);
    this.emitChangeEvent(action.type);
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

  private recordHistory(action: EditorAction) {
    const shouldClearHistory =
      action.type === "document:swap" && action.payload.clearHistory;

    if (shouldClearHistory) {
      this.historyManager.clear();
    }

    this.historyManager.record();
  }

  private emitChangeEvent(trigger: ChangeTrigger) {
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
