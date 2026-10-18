import type { EditorDocument } from "../../document/EditorDocument";
import { createEvent } from "../../events/editor-event-bus/createEvent";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import { HistoryRecordMismatchError } from "../../commands/errors/history-set/HistoryRecordMismatchError";
import type { DocumentHistory } from "../DocumentHistory";

interface HistoryManagerConfig {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
}

/**
 * Mutates history. It restores history snapshots into the document and emits the history events.
 *
 * It never changes the document in any other way because only commands are allowed to do that.
 */
export class HistoryManager {
  private readonly document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly eventBus: EditorEventBus;

  constructor({ document, history, eventBus }: HistoryManagerConfig) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
  }

  /**
   * Adds the current document as a new record in the history.
   */
  public record(): void {
    this.history.add(this.document.toJSON());
  }

  public clear(): void {
    this.history.clear();
  }

  public undo(): void {
    const previousDocumentJSON = this.history.undo();

    if (!previousDocumentJSON) {
      return;
    }

    this.document.swap(previousDocumentJSON);
    this.eventBus.emit("history:undo", createEvent("history:undo", {}));
  }

  public redo(): void {
    const nextDocumentJSON = this.history.redo();

    if (!nextDocumentJSON) {
      return;
    }

    this.document.swap(nextDocumentJSON);
    this.eventBus.emit("history:redo", createEvent("history:redo", {}));
  }

  /**
   * Throws a `HistoryIndexOutOfRangeError` if the index is out of range.
   */
  public jumpTo(index: number): void {
    const documentJSON = this.history.jumpTo(index);

    if (!documentJSON) {
      return;
    }

    this.document.swap(documentJSON);
    this.eventBus.emit("history:jump", createEvent("history:jump", { index }));
  }

  /**
   * Throws a `HistoryRecordMismatchError` if the last record of the new history is not the current document.
   */
  public setHistory(newHistory: readonly string[]): void {
    const lastRecordInHistory = newHistory.at(-1);

    if (lastRecordInHistory && lastRecordInHistory !== this.document.toJSON()) {
      throw new HistoryRecordMismatchError();
    }

    this.history.setHistory(newHistory);

    this.eventBus.emit(
      "history:set",
      createEvent("history:set", {
        history: this.history.getHistory(),
        currentPosition: this.history.getCurrentPosition(),
        currentRecord: this.history.getCurrent(),
      }),
    );
  }
}
