import { EmptyInitialHistoryJsonError } from "../errors/EmptyInitialHistoryJsonError";
import { HistoryIndexOutOfRangeError } from "../errors/HistoryIndexOutOfRangeError";
import { InvalidHistoryLimitError } from "../errors/InvalidHistoryLimitError";
import { DOCUMENT_HISTORY_RECORDS_LIMIT } from "./DocumentHistory.utils";

interface DocumentHistoryConfig {
  initialDocumentJSON: string;
  limit?: number;
}

export class DocumentHistory {
  private history: string[];
  private currentIndex: number;
  private readonly recordsLimit: number;

  constructor({
    initialDocumentJSON,
    limit = DOCUMENT_HISTORY_RECORDS_LIMIT,
  }: DocumentHistoryConfig) {
    if (limit === 0) {
      throw new InvalidHistoryLimitError(limit);
    }

    if (!initialDocumentJSON) {
      throw new EmptyInitialHistoryJsonError();
    }

    this.history = [initialDocumentJSON];
    this.currentIndex = 0;
    this.recordsLimit = limit;
  }

  /**
   * Return shallow copy of the history array.
   */
  public getHistory(): string[] {
    return [...this.history];
  }

  public setHistory(history: readonly string[]): void {
    this.history = [...history];
    this.currentIndex = this.history.length - 1;
  }

  public getCurrent(): string | null {
    if (this.history.length === 0) {
      return null;
    }

    return this.history[this.currentIndex];
  }

  public add(documentJSON: string): void {
    const historyHasItemAheadOfCurrent = this.hasItemsInHistoryAhead();

    if (historyHasItemAheadOfCurrent) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    const recordsLimitReached = this.history.length + 1 > this.recordsLimit;

    if (recordsLimitReached && !this.hasItemsInHistoryAhead()) {
      this.history.shift();
    }

    this.history.push(documentJSON);
    this.currentIndex = this.history.length - 1;
  }

  public redo(): string | null {
    if (!this.hasItemsInHistoryAhead()) {
      return null;
    }

    this.currentIndex++;
    return this.getCurrent();
  }

  private hasItemsInHistoryAhead(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public undo(): string | null {
    if (this.currentIndex <= 0) {
      return null;
    }

    this.currentIndex--;
    return this.getCurrent();
  }

  /**
   * Jumps to the specified index and returns the record at the index.
   *
   * Returns null if the index is the same as the current.
   *
   * Throws an `Error` if the index is out of range.
   * @returns
   */
  public jumpTo(index: number): string | null {
    const isIndexOutOfRange = index < 0 || index >= this.history.length;

    if (isIndexOutOfRange) {
      throw new HistoryIndexOutOfRangeError(index);
    }

    if (index === this.currentIndex) {
      return null;
    }

    this.currentIndex = index;
    return this.getCurrent();
  }

  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  public getSize(): number {
    return this.history.length;
  }

  public getCurrentPosition(): number {
    return this.currentIndex;
  }

  public getLimit(): number {
    return this.recordsLimit;
  }
}
