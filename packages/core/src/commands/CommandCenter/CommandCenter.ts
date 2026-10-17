import type { EditorAction, EditorActionType } from "../../actions/actions.models";
import type { DocumentHistory } from "../../history/DocumentHistory";
import { HistoryManager } from "../../history/HistoryManager";
import type { HistoryOperationType } from "../../history/models/history-operation.models";
import { EditorDocument } from "../../document/EditorDocument";
import {
  createEditorChangeEvent,
  createEditorPersistEvent,
} from "../../events/editor-event-bus/editorEvent.emits";
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
 * - It emits the editor change events after every action and history operation.
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
      eventBus: this.eventBus,
      history: this.history,
    });

    command.execute();
    this.emitChangeEvents(action.type);
  }

  public undo(): void {
    this.historyManager.undo();
    this.emitChangeEvents("history:undo");
  }

  public redo(): void {
    this.historyManager.redo();
    this.emitChangeEvents("history:redo");
  }

  public jumpTo(index: number): void {
    this.historyManager.jumpTo(index);
    this.emitChangeEvents("history:jump");
  }

  public setHistory(newHistory: readonly string[]): void {
    this.historyManager.setHistory(newHistory);
    this.emitChangeEvents("history:set");
  }

  private emitChangeEvents(trigger: ChangeTrigger) {
    const documentJSON = this.document.toJSON();

    this.eventBus.emit(
      "editor:persist",
      createEditorPersistEvent({
        documentJSON,
        history: this.history.getHistory(),
        triggerAction: trigger,
      }),
    );

    this.eventBus.emit(
      "editor:change",
      createEditorChangeEvent({
        documentJSON,
        history: this.history.getHistory(),
        currentPositionInHistory: this.history.getCurrentPosition(),
        root: this.document.getRoot(),
        triggerAction: trigger,
      }),
    );
  }
}
