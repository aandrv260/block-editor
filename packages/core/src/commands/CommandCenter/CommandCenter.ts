import type { EditorAction, EditorActionType } from "../../actions/actions.models";
import { DocumentHistory } from "../../history/DocumentHistory";
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

/**
 * Responsibilities:
 * - For an action, it will execute the command corresponding to the action and update the history.
 * - This is the only part of the system allowed to mutate the document and history.
 */
export class CommandCenter {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly eventBus: EditorEventBus;

  constructor({ document, history, eventBus }: CommandCenterConfig) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
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
    this.emitPersistanceEvent(action.type);
    this.emitEditorChangeEvent(action.type);
  }

  private emitEditorChangeEvent(triggerActionType: EditorActionType) {
    this.eventBus.emit(
      "editor:change",
      createEditorChangeEvent({
        documentJSON: this.document.toJSON(),
        history: this.history.getHistory(),
        currentPositionInHistory: this.history.getCurrentPosition(),
        root: this.document.getRoot(),
        triggerAction: triggerActionType,
      }),
    );
  }

  private emitPersistanceEvent(triggerActionType: EditorActionType) {
    this.eventBus.emit(
      "editor:persist",
      createEditorPersistEvent({
        documentJSON: this.document.toJSON(),
        history: this.history.getHistory(),
        triggerAction: triggerActionType,
      }),
    );
  }
}
