import type { DeepReadonly } from "@/common/types/object.types";
import type { EditorAction } from "@/actions/actions.models";
import type { Block, DocumentNode } from "@/blocks/models/block.models";
import type { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import type {
  EditorEventHandler,
  EditorEventType,
} from "@/events/editor-event-bus/editorEvent.models";

export interface IEditor {
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
   * This enables you to mutate the editor state. Actions are pure and without any side effects.
   *
   * Do not mutate the editor document directly. Always dispatch actions to ensure predictability and purity in your application code.
   *
   * You can either pass the whole action object yourself or use the provided action creator utils `moveBlock`, `insertBlock`, `updateBlock`, `deleteBlock` for better readability and clarity.
   *
   * Example:
   * ```TS
   * editor.dispatchAction(moveBlock({ blockId: '1', targetId: '2', strategy: 'before' }));
   * ```
   */
  dispatchAction(action: EditorAction): void;

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
   * Undo the last action. This will reset the current position in the history to the previous index. Emits a `history:undo` event.
   * @returns The JSON snapshot of the document at the previous index. Returns null if the current is the first record in history.
   */
  undo(): void;

  /**
   * Redo the last action. This will reset the current position in the history to the next index. Emits a `history:redo` event.
   */
  redo(): void;

  /**
   * Cleans up event listeners and other side effects.
   *
   * For instance, in React, you will want to use this method in the `useEffect` cleanup function.
   */
  cleanup(): void;

  subscribe<T extends EditorEventType>(
    event: T,
    handler: EditorEventHandler<T>,
  ): VoidFunction;

  unsubscribe<T extends EditorEventType>(
    event: T,
    handler: EditorEventHandler<T>,
  ): void;
}
