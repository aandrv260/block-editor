import type { DeepReadonly } from "@/common/types/object.types";
import type { CommandArgsOf } from "@/commands/executors/commandExecutors.models";
import type { Block, DocumentNode } from "@/blocks/models/block.models";
import type { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import type {
  EditorEventHandler,
  EditorEventsMap,
  EditorEventType,
} from "@/events/editor-event-bus/editorEvent.models";
import type { IEventStream } from "@/events/EventStream/IEventStream";
import type { SwapDocumentPayload } from "@/commands/executors/SwapDocumentCommand/SwapDocumentCommand";
import type {
  CommandType,
  DefaultEditorSchema,
  EditorSchema,
} from "./editor-schema.models";

export interface IEditor<TSchema extends EditorSchema = DefaultEditorSchema> {
  readonly ROOT_ID: string;

  /**
   * Return shallow copy of the document history.
   */
  getHistory(): readonly string[];

  /**
   * Return the current position in the history. It's a zero-based index.
   *
   * Returns -1 if the history is empty which is rare.
   */
  getCurrentPositionInHistory(): number;

  /**
   * Executes the command registered for the type. The payload is typed by the command, and commands without a payload take no second argument.
   *
   * Throws an `UnknownCommandError` if no command is registered for the type.
   *
   * Example:
   * ```TS
   * editor.execute("moveBlock", {
        blockId: "1",
        targetId: "2",
        strategy: "before",
    });
   * ```
   */
  execute<TType extends CommandType<TSchema>>(
    type: TType,
    ...args: CommandArgsOf<TSchema["commands"][TType]>
  ): void;

  /**
   * Set the history of the editor.
   * This is useful when you want to load the history from an external source, such as a server, localStorage, etc and you want to sync it with the editor state.
   *
   *  This will reset the current position in the history to the last item in the new history.
   * If the new history is empty, the current position will be set to -1.
   * @param history - The new history to set.
   */
  setHistory(history: readonly string[]): void;

  /**
   * Get the root block from the document.
   * @returns The root block.
   */
  getRoot(): DeepReadonly<DocumentRoot>;

  /**
   * Get the previous sibling of a block.
   */
  getPreviousSiblingBlock(blockId: string): DeepReadonly<Block> | null;

  /**
   * Get the next sibling of a block.
   */
  getNextSiblingBlock(blockId: string): DeepReadonly<Block> | null;

  /**
   * Get the size of the document. Includes the root and all of its descendants no matter how deep in the tree they are.
   * @returns The size of the document.
   */
  getDocumentSize(): number;

  /**
   * Check if the given block is the only block in the document excluding the root.
   * @param blockId - The ID of the block to check.
   */
  isOnlyBlockInDocument(blockId: string): boolean;

  /**
   * Get a block from the document. Very usefull for UI components to get the block data they need.
   *
   * Please keep in mind that this will return null if you pass the root block ID. If you want to get the root block, use the `getRoot` method.
   *
   * O(1) time complexity because of HashMap indexing of each block.
   * @param blockId - The ID of the block to get.
   */
  getBlock<T extends DocumentNode>(blockId: string): DeepReadonly<T> | null;

  getDocumentJSON(): string;

  /**
   * Switch to a specific point in the history. This will reset the current position in the history to the specified index. Emits a `history:jump` event.
   * @param index - The index to jump to.
   * @returns The JSON snapshot of the document at the specified index. Returns null if the index is the same as the current.
   */
  jumpToPointInHistory(index: number): string | null;

  /**
   * Undo the last change. This will reset the current position in the history to the previous index. Emits a `history:undo` event.
   * @returns The JSON snapshot of the document at the previous index. Returns null if the current is the first record in history.
   */
  undo(): void;

  /**
   * Redo the last change. This will reset the current position in the history to the next index. Emits a `history:redo` event.
   */
  redo(): void;

  /**
   * Cleans up event listeners and other side effects.
   *
   * For instance, in React, you will want to use this method in the `useEffect` cleanup function.
   */
  cleanup(): void;

  /**
   * Subscribe directly to events without any streams in between.
   *
   * Use in cases where you know you won't have to filter or map the event payload and just want to directly react to it.
   */
  subscribe<T extends EditorEventType>(
    event: T,
    handler: EditorEventHandler<T>,
  ): VoidFunction;

  /**
   * Unsubscribe from an event.
   *
   * Use in cases where you want to unsubscribe from an event that you subscribed to directly with subscribe() or through an event stream.
   */
  unsubscribe<T extends EditorEventType>(
    event: T,
    handler: EditorEventHandler<T>,
  ): void;

  on<TEvent extends EditorEventType>(
    event: TEvent,
  ): IEventStream<EditorEventsMap[TEvent]>;

  getCurrentHistoryRecord(): string | null;

  getHistoryRecordByIndex(index: number): string | null;

  /**
   * Most often used when after you load the document from a server, IndexedDB, etc and you want to sync it with the editor state.
   * @param element - The new document element to swap with.
   */
  swapDocument(payload: SwapDocumentPayload): void;
}
