import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { blockCanHaveChildren } from "./block-children.utils";

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
