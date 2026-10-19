import type { EditorDocument } from "../../document/EditorDocument";
import { createEvent } from "../../events/editor-event-bus/createEvent";
import type {
  CommandEvent,
  EditorEventBus,
} from "../../events/editor-event-bus/editorEvent.models";
import { HistoryRecordMismatchError } from "../../commands/errors/history-set/HistoryRecordMismatchError";
import type { DocumentHistory } from "../DocumentHistory";
import type { RecordedChange } from "../models/recorded-change.models";
import { canMergeWithLastChange } from "./HistoryManager.utils";

interface HistoryManagerConfig {
  document: EditorDocument;
  eventBus: EditorEventBus;
  history: DocumentHistory;
  groupDelay: number;
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
  private readonly groupDelay: number;
  private lastChange: RecordedChange | null = null;

  constructor({ document, history, eventBus, groupDelay }: HistoryManagerConfig) {
    this.document = document;
    this.eventBus = eventBus;
    this.history = history;
    this.groupDelay = groupDelay;
  }

  /**
   * Records the current document in the history.
   *
   * It replaces the last record when the change continues the last text edit, so typing is undone in one step.
   */
  public record(events: CommandEvent[]): void {
    const change: RecordedChange = { events, time: Date.now() };

    // TODO: We need to make this generic and come through extension instead of hardcodding specific event type and parts of its payloads here.
    const shouldClearHistory = events.some(
      event => event.type === "document:swap" && event.historyCleared,
    );

    if (shouldClearHistory) {
      this.history.clear();
      this.lastChange = null;
    }

    canMergeWithLastChange(this.lastChange, change, this.groupDelay)
      ? this.history.replaceCurrent(this.document.toJSON())
      : this.history.add(this.document.toJSON());

    this.lastChange = change;
  }

  public undo(): void {
    this.lastChange = null;
    const previousDocumentJSON = this.history.undo();

    if (!previousDocumentJSON) {
      return;
    }

    this.document.swap(previousDocumentJSON);
    this.eventBus.emit("history:undo", createEvent("history:undo", {}));
  }

  public redo(): void {
    this.lastChange = null;
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
    this.lastChange = null;
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
    this.lastChange = null;

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
