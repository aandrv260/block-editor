import { CommandCenter } from "@/commands/CommandCenter/CommandCenter";
import { DocumentHistory } from "@/history/DocumentHistory";
import { DEFAULT_HISTORY_GROUP_DELAY } from "@/history/HistoryManager/HistoryManager.utils";
import type { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import { EditorDocument } from "@/document/EditorDocument";
import type {
  AnyCustomEvents,
  EditorEventBus,
  EditorEventHandler,
  EditorEventsMap,
  EditorEventType,
  EventsDefinition,
  NoCustomEvents,
} from "@/events/editor-event-bus/editorEvent.models";
import { EventBus } from "@/events/event-bus/EventBus";
import type { CommandArgsOf } from "@/commands/executors/commandExecutors.models";
import type { TransactionCallback } from "@/commands/transaction/transaction.models";
import {
  DEFAULT_COMMANDS,
  type DefaultCommands,
} from "@/commands/executors/defaultCommands";
import type {
  CommandBuilder,
  CommandType,
  CustomCommands,
  EditorCommands,
  NoCustomCommands,
  WithoutBuiltInCommandNames,
} from "./editor-commands.models";
import type { IEditor } from "./IEditor";
import type { Block, DocumentNode } from "@/blocks/models/block.models";
import type { ConstructableDocumentElement } from "@/document/models/document.models";
import type { SwapDocumentPayload } from "@/commands/executors/SwapDocumentCommand/SwapDocumentCommand";
import type { DeepReadonly } from "@/common/types/object.types";
import { EventStream } from "@/events/EventStream/EventStream";
import type { IEventStream } from "@/events/EventStream/IEventStream";
import type { Extension } from "@/extensions/models/extension.models";

export interface EditorConfig<TCustomEvents, TCustomCommands> {
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

  /**
   * How many milliseconds can pass between two text edits for one undo to revert both.
   * Text edits that continue each other within this time are saved as one history record.
   * The default is 500.
   */
  historyGroupDelay?: number;

  /**
   * Define custom events that custom commands can return and listeners can subscribe to.
   */
  events?: EventsDefinition<TCustomEvents>;

  /**
   * Add custom commands to the editor.
   * Create each command with `createCommand`, so its payload and the events it returns are typed.
   */
  commands?: (
    builder: CommandBuilder<TCustomEvents>,
  ) => WithoutBuiltInCommandNames<TCustomCommands>;

  /**
   * Extensions hook into every command and transaction of the editor and run in array order.
   * Two extensions with the same name throw a `DuplicateExtensionError`, and an extension without hooks throws an `ExtensionWithoutHooksError`.
   * The `beforeCommand`, `afterCommand` and `beforeCommit` hooks must be synchronous.
   */
  extensions?: readonly Extension[];
}

// TODO: Move docs to IEditor interface. Also, define a more clear contract and use cases for the cleanup method or remove it.
export class Editor<
  TCustomEvents extends AnyCustomEvents = NoCustomEvents,
  TCustomCommands extends CustomCommands<TCustomEvents> = NoCustomCommands,
> implements IEditor<TCustomEvents, TCustomCommands> {
  private document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly eventBus: EventBus<EditorEventsMap<TCustomEvents>>;
  private readonly commandCenter: CommandCenter<EditorCommands<TCustomCommands>>;
  public readonly ROOT_ID: string;

  constructor({
    initialDocument,
    historyLimit,
    historyGroupDelay = DEFAULT_HISTORY_GROUP_DELAY,
    commands,
    extensions = [],
  }: EditorConfig<TCustomEvents, TCustomCommands> = {}) {
    this.document = EditorDocument.from(initialDocument);
    this.ROOT_ID = this.document.ROOT_ID;
    this.eventBus = new EventBus();

    this.history = new DocumentHistory({
      initialDocumentJSON: this.document.toJSON(),
      limit: historyLimit,
    });

    this.commandCenter = new CommandCenter<EditorCommands<TCustomCommands>>({
      eventBus: this.eventBus as EditorEventBus,
      history: this.history,
      document: this.document,
      commands: {
        ...DEFAULT_COMMANDS,
        ...commands?.({ createCommand: command => command }),
      },
      extensions,
      historyGroupDelay,
    });
  }

  public getHistory(): readonly string[] {
    return this.history.getHistory();
  }

  public setHistory(history: readonly string[]): void {
    this.commandCenter.setHistory(history);
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

  public execute<TType extends CommandType<TCustomCommands>>(
    type: TType,
    ...args: CommandArgsOf<EditorCommands<TCustomCommands>[TType]>
  ): void {
    this.commandCenter.execute(type, ...args);
  }

  public transaction<TReturn>(
    callback: TransactionCallback<EditorCommands<TCustomCommands>, TReturn>,
  ): void {
    this.commandCenter.transaction(callback);
  }

  public getRoot(): DeepReadonly<DocumentRoot> {
    return this.document.getRoot();
  }

  public getPreviousSiblingBlock(blockId: string): DeepReadonly<Block> | null {
    return this.document.getPreviousSiblingBlock(blockId);
  }

  public getNextSiblingBlock(blockId: string): DeepReadonly<Block> | null {
    return this.document.getNextSiblingBlock(blockId);
  }

  public getDocumentSize(): number {
    return this.document.size;
  }

  public isOnlyBlockInDocument(blockId: string): boolean {
    return this.document.isOnlyBlockInDocument(blockId);
  }

  public getBlock<T extends DocumentNode>(blockId: string): DeepReadonly<T> | null {
    return this.document.getBlockOrRoot(blockId) as DeepReadonly<T> | null;
  }

  public jumpToPointInHistory(index: number): string | null {
    this.commandCenter.jumpTo(index);
    return this.history.getCurrent();
  }

  public undo(): void {
    this.commandCenter.undo();
  }

  public redo(): void {
    this.commandCenter.redo();
  }

  public getDocumentJSON(): string {
    return this.document.toJSON();
  }

  public cleanup(): void {
    this.commandCenter.cleanup();
    this.eventBus.cleanup();
  }

  public on<TEvent extends EditorEventType<TCustomEvents>>(
    event: TEvent,
  ): IEventStream<EditorEventsMap<TCustomEvents>[TEvent]> {
    return new EventStream(handler => this.eventBus.on(event, handler));
  }

  public subscribe<T extends EditorEventType<TCustomEvents>>(
    event: T,
    handler: EditorEventHandler<T, TCustomEvents>,
  ): VoidFunction {
    const unsubscribe = this.eventBus.on(event, handler);
    return unsubscribe;
  }

  public unsubscribe<T extends EditorEventType<TCustomEvents>>(
    event: T,
    handler: EditorEventHandler<T, TCustomEvents>,
  ): void {
    this.eventBus.off(event, handler);
  }

  public swapDocument(payload: SwapDocumentPayload): void {
    const commandCenter = this.commandCenter as CommandCenter<DefaultCommands>;
    commandCenter.execute("swapDocument", payload);
  }
}
