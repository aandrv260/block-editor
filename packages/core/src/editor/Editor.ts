import { CommandCenter } from "@/commands/CommandCenter/CommandCenter";
import { DocumentHistory } from "@/history/DocumentHistory";
import type { EditorAction } from "@/actions/actions.models";
import type { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import { EditorDocument } from "@/document/EditorDocument";
import type {
  EditorEventBus,
  EditorEventHandler,
  EditorEventsMap,
  EditorEventType,
} from "@/events/editor-event-bus/editorEvent.models";
import { EventBus } from "@/events/event-bus/EventBus";
import type { IEditor } from "./IEditor";
import type { Block } from "@/blocks/models/block.models";
import type { ConstructableDocumentElement } from "@/document/models/document.models";
import type { DeepReadonly } from "@/common/types/object.types";
import {
  historyJump,
  historyRedo,
  historyUndo,
  swapDocument,
} from "@/actions/actions";
import { EventStream } from "@/events/EventStream/EventStream";
import type { IEventStream } from "@/events/EventStream/IEventStream";
import { historySet } from "@/actions/actions";

interface SwapDocumentConfig {
  element: ConstructableDocumentElement;
  clearHistory?: boolean;
}

interface EditorConfig {
  /**
   * The initial document to use for the editor. The editor can construct a document out of a `JSON` string, a `DocumentRoot` or `EditorDocument`.
   *
   * If you don't pass it, the editor will create an empty document.
   */
  initialDocument?: ConstructableDocumentElement;

  /**
   * For performance reasons, you can limit the number of history records to save memory and CPU time. The default limit is 150. You can set it to 0 to disable the history.
   *
   * The maximum number of history records allowed for the time being is 150.
   */
  historyLimit?: number;
}

// TODO: Move docs to IEditor interface. Also, define a more clear contract and use cases for the cleanup method or remove it.
export class Editor implements IEditor {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly eventBus: EditorEventBus;
  private readonly commandCenter: CommandCenter;
  public readonly ROOT_ID: string;

  constructor({ initialDocument, historyLimit }: EditorConfig = {}) {
    this.document = EditorDocument.from(initialDocument);
    this.ROOT_ID = this.document.ROOT_ID;
    this.eventBus = new EventBus();

    this.history = new DocumentHistory({
      initialDocumentJSON: this.document.toJSON(),
      limit: historyLimit,
    });

    this.commandCenter = new CommandCenter({
      eventBus: this.eventBus,
      history: this.history,
      document: this.document,
    });
  }

  public getHistory(): readonly string[] {
    return this.history.getHistory();
  }

  public setHistory(history: readonly string[]): void {
    this.commandCenter.processAction(historySet({ history }));
  }

  public getCurrentHistoryRecord(): string | null {
    return this.history.getCurrent();
  }

  public getHistoryRecordByIndex(index: number): string | null {
    return this.history.getHistory().at(index) ?? null;
  }

  public getCurrentPositionInHistory(): number {
    return this.history.getCurrentPosition();
  }

  public dispatchAction(action: EditorAction): void {
    this.commandCenter.processAction(action);
  }

  public getRoot(): DeepReadonly<DocumentRoot> {
    return this.document.getRoot();
  }

  public getDocumentSize(): number {
    return this.document.size;
  }

  public getBlock<T extends Block | DocumentRoot>(
    blockId: string,
  ): DeepReadonly<T> | null {
    return this.document.getBlockOrRoot(blockId) as DeepReadonly<T> | null;
  }

  public jumpToPointInHistory(index: number): string | null {
    this.commandCenter.processAction(historyJump(index));
    return this.history.getCurrent();
  }

  public undo(): void {
    this.commandCenter.processAction(historyUndo());
  }

  public redo(): void {
    this.commandCenter.processAction(historyRedo());
  }

  public getDocumentJSON(): string {
    return this.document.toJSON();
  }

  public cleanup(): void {
    this.eventBus.cleanup();
  }

  public on<TEvent extends EditorEventType>(
    event: TEvent,
  ): IEventStream<EditorEventsMap[TEvent]> {
    return new EventStream(handler => this.eventBus.on(event, handler));
  }

  /**
   * Subscribe directly to events without any streams in between.
   *
   * Use in cases where you know you won't have to filter or map the event payload and just want to directly react to it.
   */
  public subscribe<T extends EditorEventType>(
    event: T,
    handler: EditorEventHandler<T>,
  ): VoidFunction {
    const unsubscribe = this.eventBus.on(event, handler);
    return unsubscribe;
  }

  /**
   * Unsubscribe from an event.
   *
   * Use in cases where you want to unsubscribe from an event that you subscribed to directly with subscribe() or through an event stream.
   */
  public unsubscribe<T extends EditorEventType>(
    event: T,
    handler: EditorEventHandler<T>,
  ): void {
    this.eventBus.off(event, handler);
  }

  /**
   * Most often used when after you load the document from a server, localStorage, etc and you want to sync it with the editor state.
   * @param element - The new document element to swap with.
   */
  public swapDocument({ element, clearHistory }: SwapDocumentConfig): void {
    this.commandCenter.processAction(
      swapDocument({
        element,
        clearHistory,
      }),
    );
  }
}
