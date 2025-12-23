import type { Block } from "../../blocks/models/block.models";
import type { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import type { BlockPayload } from "../models/document-payload.models";
import {
  blockPayloadCanHaveChildren,
  getPayloadChildren,
} from "./block-children.utils";
import { BlockCannotHaveChildrenError } from "../errors/common";

// Maybe later make the root a `DocumentNode` to enable any Node to be passed as an argument. Only if there is a use case, of course.
export const buildMapFromRoot = (root: DocumentRoot): Map<string, Block> => {
  const map = new Map<string, Block>();
  const queue: Block[] = [...root.children];
  let currentIndex = 0;

  while (currentIndex < queue.length) {
    const current = queue[currentIndex];

    map.set(current.id, current);
    currentIndex++;

    if (current.children) {
      queue.push(...current.children);
    }
  }

  return map;
};

const mapBlockChildrenToDocumentBlocks = (blockPayload: BlockPayload): Block[] => {
  return getPayloadChildren(blockPayload).map<Block>(child =>
    blockPayloadToDocumentBlock(child, blockPayload.id),
  );
};

export const blockPayloadToDocumentBlock = (
  blockPayload: BlockPayload,
  parentId: string,
): Block => {
  const clonedBlockPayload = structuredClone(blockPayload);

  const finalBlock: Block = {
    ...clonedBlockPayload,
    children: mapBlockChildrenToDocumentBlocks(clonedBlockPayload),
    parentId,
  };

  const canBlockHaveChildren = blockPayloadCanHaveChildren(clonedBlockPayload);

  if (!canBlockHaveChildren && clonedBlockPayload.children) {
    throw new BlockCannotHaveChildrenError(clonedBlockPayload.id);
  }

  if (!canBlockHaveChildren) {
    delete finalBlock.children;
  }

  return finalBlock;
};
