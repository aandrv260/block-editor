import type { Block, DocumentNode } from "../../blocks/models/block.models";
import type { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import type { EditorDocument } from "../EditorDocument";
import type { BlockPayload } from "./document-payload.models";

export type MoveBlockStrategy = "before" | "after" | "append";
export type ConstructableDocumentElement = string | DocumentRoot | EditorDocument;

export type BlockMap = Map<string, Block>;
export type ReadonlyBlockMap = ReadonlyMap<string, Block>;

export interface MoveBlockOptions {
  blockId: string;
  targetId: string;
  strategy: MoveBlockStrategy;
}

/**
 * Strategy for handling children when updating a block.
 *
 * @remarks
 * This defines how children of the block being updated should be handled.
 * Each strategy has specific validation rules and behaviors:
 *
 * **`preserve`** Keeps the existing children of the block being updated.
 *   - Both the old block and the new block must have the same capability regarding children
 *     (either both can have children, or both cannot have children).
 *   - If the old block can have children but the new block cannot, an error is thrown.
 *   - If the old block cannot have children but the new block can, an error is thrown.
 *   - The children are deep cloned to prevent mutation.
 *   - The parentId of preserved children is automatically updated to point to the new block's ID.
 *
 * **`replace`** Replaces the old block's children with new children from the payload.
 *   - Both the old block and the new block must be able to have children.
 *   - The payload must include a `children` property with the new children.
 *   - If either block cannot have children, an error is thrown.
 *   - If the payload doesn't include children, an error is thrown.
 *   - The new children are deep cloned from the payload to prevent mutation.
 *   - All old children and their descendants are removed from the document.
 *
 * **`drop`** Removes all children from the old block (default strategy).
 *   - No validation is performed - this strategy works regardless of whether blocks can have children.
 *   - All existing children and their descendants are removed from the document.
 *   - If the new block can have children, the children property is set to an empty array unless you pass children to the payload.
 *   - If the new block cannot have children, the children property is removed.
 *   - Any children provided in the payload are ignored.
 */
export type UpdateBlockChildrenStrategy = "preserve" | "replace" | "drop";

/**
 * Options for updating a block.
 *
 * @property childrenStrategy - The strategy to use when handling children during the update.
 *   Defaults to "drop" if not specified. See {@link UpdateBlockChildrenStrategy} for detailed
 *   information about each strategy.
 */
export type UpdateBlockOptions = {
  childrenStrategy: UpdateBlockChildrenStrategy;
};

/**
 * The DocumentTree interface is used to define the contract for the document tree.
 * It is used to ensure that the document tree whether immutable or mutable, has the same contract hence it is predictable to use across the codebase.
 */
export interface DocumentTree {
  /**
   * Append a block to a parent block.
   * @param parentId - The ID of the parent block to append the new block to.
   * @param newBlock - The block to append.
   */
  appendChild(parentId: string, newBlock: Block): void;

  /**
   * Insert a block before a target block.
   * @param targetId - The ID of the target block to insert the new block before.
   * @param newBlock - The block to insert.
   */
  insertBefore(targetId: string, newBlock: Block): void;

  /**
   * Insert a block after a target block.
   * @param targetId - The ID of the target block to insert the new block after.
   * @param newBlock - The block to insert.
   */
  insertAfter(targetId: string, newBlock: Block): void;

  /**
   * Remove a block from the document. If a block has children, they are removed as well.
   * @param blockId - The ID of the block to remove.
   */
  remove(blockId: string): void;

  /**
   * Swap the entire document with a new one mutating the current instance entirely. Use sparingly.
   * @param newDocumentJSON - The JSON string of the new document.
   */
  swap(newDocumentJSON: string): void;

  /**
   * Updates a block by replacing it with a new block based on the provided payload.
   *
   * @remarks
   * This method provides fine-grained control over how children are handled during the update
   * through the `childrenStrategy` option. The block is completely replaced, meaning the old block
   * is removed from the document and a new block is inserted in its place.
   *
   * - The block to be updated must exist in the document (throws if not found).
   * - The document root cannot be updated (throws if attempted).
   * - The new block's ID must not conflict with existing blocks (unless it's the same as the block being updated).
   * - The block maintains its position in the parent's children array.
   * - All payload data is deep cloned to prevent mutation.
   * - The parentId of the new block is automatically set to match the old block's parent.
   *
   * **Children Strategy Behaviors:**
   *
   * 1. **"drop"** (default): Removes all existing children.
   *    - Works with any block type combination.
   *    - All descendants of the old block are removed from the document.
   *    - If the new block can have children, children is set to `[]`.
   *    - If the new block cannot have children, children is set to `undefined`.
   *    - Payload children are ignored.
   *
   * 2. **"preserve"**: Keeps existing children.
   *    - Both old and new blocks must have the same children capability.
   *    - Existing children are deep cloned and their parentId is updated to the new block's ID.
   *    - All descendants remain in the document with updated parent references.
   *    - Payload children are ignored.
   *    - Throws if old block can have children but new block cannot.
   *    - Throws if old block cannot have children but new block can.
   *
   * 3. **"replace"**: Replaces children with new ones from payload.
   *    - Both old and new blocks must be able to have children.
   *    - Payload must include a `children` property.
   *    - All old children and their descendants are removed.
   *    - New children from payload are deep cloned and added to the document.
   *    - Throws if either block cannot have children.
   *    - Throws if payload doesn't include children.
   *
   * **Return Type:**
   * - For mutable documents: returns `void` (mutates in place).
   * - For immutable documents: returns a new `DocumentTree<"immutable">` instance.
   *
   * @param blockId - The ID of the block to update. Must exist in the document and cannot be the root.
   * @param payload - The new block data. Must include `id`, `type`, and `data` properties.
   *   If using "replace" strategy, must also include `children`. The payload is deep cloned.
   * @param options - Optional configuration for the update operation.
   *   - `childrenStrategy`: How to handle children (defaults to "drop").
   *   See {@link UpdateBlockOptions} for details.
   *
   * @throws {Error} If the block ID doesn't exist in the document.
   * @throws {Error} If attempting to update the document root.
   * @throws {Error} If the new block's ID conflicts with an existing block (unless it's the same as blockId).
   * @throws {Error} If using "preserve" strategy and blocks have incompatible children capabilities.
   * @throws {Error} If using "replace" strategy and either block cannot have children.
   * @throws {Error} If using "replace" strategy and payload doesn't include children.
   *
   * @example
   * ```TS
   * // Drop children (default)
   * document.updateBlockNew(blockId, newBlock);
   * document.updateBlockNew(blockId, newBlock, { childrenStrategy: "drop" });
   *
   * // Preserve existing children
   * document.updateBlockNew(blockId, newBlock, { childrenStrategy: "preserve" });
   *
   * // Replace with new children
   * document.updateBlockNew(blockId, { ...newBlock, children: [child1, child2] }, {
   *   childrenStrategy: "replace"
   * });
   * ```
   */
  updateBlock(
    blockId: string,
    payload: BlockPayload,
    options?: UpdateBlockOptions,
  ): void;

  /**
   * Move a block to a target block.
   * @param blockId - The ID of the block to move.
   * @param targetId - The ID of the target block to move the block to. Can be the root.
   * @param strategy - The strategy to use to move the block. You can move the block before, after, or append it to the target block.
   */
  moveBlock(options: MoveBlockOptions): void;

  getRoot(): DocumentRoot;

  /**
   * Get a block from the document.
   * Has O(1) time complexity because of HashMap indexing of each block.
   * @param blockId - The ID of the block to get.
   */
  getBlock(blockId: string): Block | null;

  /**
   * Traverses the entire document subtree using level-order (breadth-first) traversal, starting from the specified root node's first child.
   *
   * @param callback - A callback to execute on each visited block. Receives the current block as an argument.
   *
   * @param root - The root node to start traversal from. Defaults to the document root. All descendants of this node will be traversed except the root itself.
   *
   * @example
   * // Log all block IDs in the document (excluding the root)
   * document.traverse(block => console.log(block.id));
   *
   * @example
   * // Start traversal from a specific block's subtree
   * const block = document.getBlock("some-block-id");
   * if (block) {
   *   document.traverse(block => { ... }, block);
   * }
   */
  traverse(callback: (block: Block) => void, root: DocumentNode): void;

  toJSON(): string;
}
