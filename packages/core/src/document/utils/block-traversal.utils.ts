import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { blockCanHaveChildren } from "./block-children.utils";

/**
 * Traverses the document subtree using level-order (breadth-first) traversal, starting from the specified root node's first child.
 * @param root - The node to start traversal from.
 * @param callback
 */
export const traverse = (root: DocumentNode, callback: (block: Block) => void) => {
  const queue: Block[] = [...(root.children ?? [])];
  let currentIndex = 0;

  while (currentIndex < queue.length) {
    const currentBlock = queue[currentIndex];

    callback(currentBlock);

    if (blockCanHaveChildren(currentBlock)) {
      queue.push(...currentBlock.children);
    }

    currentIndex++;
  }
};
